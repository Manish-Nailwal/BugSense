import DebugSession from "../models/DebugSession.model.js";
import User from "../models/User.model.js";
import LibraryArticle from "../models/LibraryArticle.model.js";
import ApiQuota from "../models/ApiQuota.model.js";
import { streamDebugAnalysis, summarizeConversation, safeWrite } from "../services/gemini.service.js";
import { mockDebugAnalysis } from "../services/mock.service.js";
import { generateArticle } from "../services/article.service.js";
import { stripMeta } from "../utils/text.js";
import { reserveInputTokens } from "../utils/rateLimiter.js";
import {
  NORMAL_MODEL,
  NORMAL_MODEL_KEY,
  DEEP_MODEL_KEY,
  DEEP_FALLBACK_MODEL_KEY,
  DEEP_FALLBACK_DAILY_LIMIT,
  NORMAL_DAILY_LIMIT,
  NORMAL_USABLE_LIMIT,
  NORMAL_DAILY_RESERVE,
  DEEP_DAILY_LIMIT,
  DEEP_USER_DAILY_LIMIT,
  CONTEXT_WINDOW,
  SUMMARY_TRIGGER,
  MAX_TURN_CHARS,
  MAX_SUMMARY_CHARS,
  getQuotaDate,
  pickDeepModel,
} from "../config/gemini.js";

// Rough estimate of the input tokens a request will send to the model,
// mirroring how the service truncates each turn / the summary.
const SYSTEM_TOKENS_EST = 700;
const estimateInputTokens = (priorTurns, summary, input) => {
  let chars = Math.min((summary || "").length, MAX_SUMMARY_CHARS) + (input || "").length;
  for (const m of priorTurns) {
    chars += Math.min((m.content || "").length, MAX_TURN_CHARS);
  }
  return SYSTEM_TOKENS_EST + Math.ceil(chars / 4);
};

/**
 * Builds the model context for a follow-up from the DB (source of truth):
 * keeps the last CONTEXT_WINDOW turns verbatim and folds anything older into a
 * lazily-refreshed rolling summary stored on the session.
 * @returns {Promise<{ priorTurns: Array, contextSummary: string }>}
 */
const buildConversationContext = async (session) => {
  const msgs = session.messages || [];
  let contextSummary = session.contextSummary || "";

  if (msgs.length <= SUMMARY_TRIGGER) {
    return { priorTurns: msgs, contextSummary: "" };
  }

  const keepFrom = msgs.length - CONTEXT_WINDOW; // index where verbatim window starts
  let summarizedTurns = session.summarizedTurns || 0;

  // New turns have slid out of the window since we last summarized — fold them in.
  if (summarizedTurns < keepFrom) {
    const newlyOlder = msgs.slice(summarizedTurns, keepFrom);
    contextSummary = await summarizeConversation(newlyOlder, contextSummary, NORMAL_MODEL);
    summarizedTurns = keepFrom;
    await DebugSession.updateOne(
      { _id: session._id },
      { contextSummary, summarizedTurns },
    );
  }

  return { priorTurns: msgs.slice(keepFrom), contextSummary };
};

// Fetch (or lazily create) today's global quota document.
const getTodayQuota = async () => {
  const today = getQuotaDate();
  return ApiQuota.findOneAndUpdate(
    { date: today },
    {
      $setOnInsert: {
        date: today,
        counts: { [NORMAL_MODEL_KEY]: 0, [DEEP_MODEL_KEY]: 0 },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

// Is *any* deep pool still available globally today?
const deepGlobalAvailable = (counts) => pickDeepModel(counts) !== null;

// How many Deep Mode requests a user has spent *today* (resets across days).
const deepUsedToday = (user, today) =>
  user?.deepUsage?.date === today ? user.deepUsage.count || 0 : 0;

// @desc    Analyze an error and stream response
// @route   POST /api/debug/analyze
// @access  Private
export const analyzeError = async (req, res) => {
  const { errorLog, sessionId, deepMode: rawDeep = false } = req.body;
  const deepMode = !!rawDeep;

  if (!errorLog) {
    return res
      .status(400)
      .json({ success: false, message: "No error log provided" });
  }

  try {
    const today = getQuotaDate();
    const quota = await getTodayQuota();
    const isFollowUp = !!sessionId;

    // 0a. Build conversation context from the DB (source of truth):
    //     last CONTEXT_WINDOW turns verbatim + a rolling summary of older ones.
    let priorTurns = [];
    let contextSummary = "";
    if (isFollowUp) {
      const sessionDoc = await DebugSession.findOne({
        _id: sessionId,
        userId: req.user._id,
      });
      if (sessionDoc) {
        const ctx = await buildConversationContext(sessionDoc);
        priorTurns = ctx.priorTurns;
        contextSummary = ctx.contextSummary;
      }
    }

    // 0b. Stay under the API's input tokens-per-minute limit (self-throttle
    //     BEFORE touching daily quota or opening the SSE stream).
    const estInput = estimateInputTokens(priorTurns, contextSummary, errorLog);
    const reservation = reserveInputTokens(estInput);
    if (!reservation.ok) {
      const secs = Math.max(1, Math.ceil(reservation.retryAfterMs / 1000));
      res.set("Retry-After", String(secs));
      return res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        message: `Trace is at its per-minute capacity. Please retry in ~${secs}s.`,
      });
    }

    // 0c. Daily quota (Resets at Pacific midnight). Model is chosen server-side.
    let modelName = NORMAL_MODEL;

    if (deepMode) {
      // (a) Per-user allowance: 1 Deep Mode request / day.
      const userUsed = deepUsedToday(req.user, today);
      if (userUsed >= DEEP_USER_DAILY_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `You've used your ${DEEP_USER_DAILY_LIMIT} Deep Mode request for today. It resets at 12:30 PM IST.`,
          code: "DEEP_USER_LIMIT",
        });
      }

      // (b) Global allowance: prefer Gemini 3 Flash, fall back to Gemini 2.5 Flash.
      const chosen = pickDeepModel(quota.counts);
      if (!chosen) {
        return res.status(429).json({
          success: false,
          message: `Deep Mode is at capacity for today. Please try standard mode or come back after 12:30 PM IST.`,
          code: "DEEP_GLOBAL_LIMIT",
        });
      }
      modelName = chosen.name;

      // Reserve both counters up-front to avoid races / abuse.
      quota.counts.set(chosen.key, (quota.counts.get(chosen.key) || 0) + 1);
      await quota.save();
      await User.findByIdAndUpdate(req.user._id, {
        deepUsage: { date: today, count: userUsed + 1 },
      });
    } else {
      // Standard chat stops at the USABLE cap; the rest is held in reserve
      // for essential actions (e.g. publishing a resolved fix).
      const globalNormal = quota.counts.get(NORMAL_MODEL_KEY) || 0;
      if (globalNormal >= NORMAL_USABLE_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `Daily request limit reached. Resets at 12:30 PM IST.`,
          code: "QUOTA_EXCEEDED",
        });
      }
      quota.counts.set(NORMAL_MODEL_KEY, globalNormal + 1);
      await quota.save();
    }

    // 1. Initialize SSE Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Handle abrupt client disconnection or stream errors. We do NOT abort
    // generation here — the model stream is independent of this socket, so we
    // let it finish and persist the full reply below (see safeWrite).
    res.on("error", (err) => {
      console.error("SSE Response Error:", err);
    });
    res.on("close", () => {
      if (!res.writableEnded) {
        console.log(`[stream] client disconnected; finishing + persisting reply for session ${activeSessionId}`);
      }
    });

    let activeSessionId = sessionId;

    // Persist the USER turn up-front so the conversation survives even if the
    // client closes the tab mid-stream (the assistant reply is appended once
    // generation completes, regardless of whether the client is still connected).
    if (!isFollowUp) {
      const session = await DebugSession.create({
        userId: req.user._id,
        rawError: errorLog,
        messages: [{ role: "user", content: errorLog }],
        aiResponse: { fullText: "Analyzing..." },
      });
      activeSessionId = session._id;

      // Send immediate ID for frontend redirection
      safeWrite(res, { metadata: { sessionId: activeSessionId } });

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.totalSessions": 1 },
      });
    } else {
      // Existing chat: append the user's follow-up now; the reply follows below.
      await DebugSession.updateOne(
        { _id: sessionId, userId: req.user._id },
        { $push: { messages: { role: "user", content: errorLog } } },
      );
    }

    // 2. Use the real Gemini service unless mocking is EXPLICITLY enabled.
    //    (NODE_ENV=development no longer forces mock — real keys are used in dev too.)
    const service =
      process.env.MOCK_AI === "true" ? mockDebugAnalysis : streamDebugAnalysis;

    const { fullText, metadata } = await service(errorLog, res, priorTurns, {
      deepMode,
      modelName,
      personalization: req.user.personalization || {},
      contextSummary,
    });

    // 4. Persist the assistant reply (cleaned — no meta blocks). The user turn was
    //    already saved above, so closing the tab can't lose the conversation.
    const cleanText = stripMeta(fullText);
    if (isFollowUp) {
      await DebugSession.findByIdAndUpdate(sessionId, {
        $push: { messages: { role: "assistant", content: cleanText } },
      });
    } else {
      // Finalize created session. Use the AI-suggested title if it gave one.
      const aiTitle =
        typeof metadata.title === "string"
          ? metadata.title.replace(/^["'\s]+|["'\s]+$/g, "").replace(/[.\s]+$/, "").slice(0, 80)
          : "";

      await DebugSession.findByIdAndUpdate(activeSessionId, {
        $push: { messages: { role: "assistant", content: cleanText } },
        "aiResponse.fullText": cleanText,
        category: metadata.category || "Unknown",
        techStack: metadata.techStack || [],
        ...(aiTitle ? { title: aiTitle } : {}),
      });
    }

    // 5. Finalize the SSE stream (no-op if the client already disconnected).
    safeWrite(res, { done: true, metadata: { ...metadata, sessionId: activeSessionId } });
    if (!res.writableEnded) res.end();
  } catch (error) {
    console.error("Analysis Error:", error);
    safeWrite(res, { error: "SERVER_PROCESS_ERROR", message: error.message });
    if (!res.writableEnded) res.end();
  }
};

// @desc    Get all sessions for logged in user
// @route   GET /api/debug/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const sessions = await DebugSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('articleId', 'slug title');

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single session detail
// @route   GET /api/debug/sessions/:id
// @access  Private
export const getSession = async (req, res) => {
  try {
    const session = await DebugSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('articleId', 'slug title');

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm a fix and publish to library
// @route   POST /api/debug/sessions/:id/confirm
// @access  Private
export const confirmFix = async (req, res, next) => {
  try {
    const { userNote, shouldPublish = true } = req.body;
    const { id: sessionId } = req.params;

    const effectiveNote = userNote && userNote.trim().length >= 5
      ? userNote
      : "User followed the AI-suggested diagnostic path and confirmed the resolution.";

    const session = await DebugSession.findOne({
      _id: sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.confirmedFix?.isConfirmed && !shouldPublish) {
      return res.status(400).json({
        success: false,
        message: "Fix already confirmed for this session",
      });
    }

    // Optional: If you want to keep track of previous versions, you could store them in a history array.
    // For now, we allow overwriting the articleId link to support "Sync Again"
    let articleResult = null;

    if (shouldPublish) {
      // 0. Article generation uses the standard model -> charge the normal pool.
      const quota = await getTodayQuota();
      const currentCount = quota.counts.get(NORMAL_MODEL_KEY) || 0;

      if (currentCount >= NORMAL_DAILY_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `Daily request limit reached. Publishing resets at 12:30 PM IST.`,
          code: "QUOTA_EXCEEDED",
        });
      }

      // Increment quota
      quota.counts.set(NORMAL_MODEL_KEY, currentCount + 1);
      await quota.save();

      // 2. Cleanup: If an article already exists for this session, delete it first (Sync Again)
      if (session.articleId) {
        await LibraryArticle.findByIdAndDelete(session.articleId);
      }

      // Generate Article
      const aiAnalysis = session.aiResponse.fullText;
      const { content, metadata, slug } = await generateArticle(
        session.rawError,
        aiAnalysis,
        effectiveNote,
        session.category,
        NORMAL_MODEL,
        session.messages,
        session.contextSummary,
      );

      // Decide the blog identity: explicit request wins, else the user's default.
      const authorDisplay = ["name", "anonymous"].includes(req.body.authorDisplay)
        ? req.body.authorDisplay
        : req.user.preferences?.defaultBlogIdentity || "name";

      // Create Library Article
      const article = await LibraryArticle.create({
        sessionId: session._id,
        authorId: req.user._id,
        slug,
        title: metadata.title,
        metaDescription: metadata.metaDescription,
        content,
        authorDisplay,
        tags: metadata.tags || [],
        errorSnippet: (session.rawError || "").substring(0, 500),
        seo: {
          ogTitle: metadata.ogTitle,
          ogDescription: metadata.metaDescription,
        },
      });

      session.articleId = article._id;
      articleResult = {
        slug: article.slug,
        title: article.title,
        url: `/library/${article.slug}`
      };
    }

    // Update Session (Common for both cases)
    if (!session.confirmedFix?.isConfirmed) {
      session.confirmedFix = {
        isConfirmed: true,
        userNote,
        confirmedAt: new Date(),
      };

      // Update User Stats (Only if marking as fixed for the first time)
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.confirmedFixes": 1 },
      });
    }

    await session.save();

    res.status(201).json({
      success: true,
      data: articleResult || { message: "Fix marked successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session (rename)
// @route   PATCH /api/debug/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await DebugSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true },
    );
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete session
// @route   DELETE /api/debug/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    const session = await DebugSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    // Articles are kept as requested by the user
    await DebugSession.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ALL of the user's conversations (Data Controls)
// @route   DELETE /api/debug/sessions
// @access  Private
export const deleteAllSessions = async (req, res) => {
  try {
    const { deletedCount } = await DebugSession.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: `Deleted ${deletedCount} conversations`, deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current daily quota usage (normal pool + this user's Deep Mode allowance)
// @route   GET /api/debug/quota
// @access  Private
export const getQuota = async (req, res) => {
  try {
    const today = getQuotaDate();
    const quota = await getTodayQuota();

    const normalUsed = quota.counts.get(NORMAL_MODEL_KEY) || 0;
    const deepGlobalUsed =
      (quota.counts.get(DEEP_MODEL_KEY) || 0) +
      (quota.counts.get(DEEP_FALLBACK_MODEL_KEY) || 0);
    const deepUserUsed = deepUsedToday(req.user, today);
    const deepGlobalLimit = DEEP_DAILY_LIMIT + DEEP_FALLBACK_DAILY_LIMIT;

    res.json({
      success: true,
      data: {
        normal: {
          used: normalUsed,
          limit: NORMAL_DAILY_LIMIT,
          usable: NORMAL_USABLE_LIMIT,
          reserve: NORMAL_DAILY_RESERVE,
          available: normalUsed < NORMAL_USABLE_LIMIT,
        },
        deep: {
          userUsed: deepUserUsed,
          userLimit: DEEP_USER_DAILY_LIMIT,
          remaining: Math.max(0, DEEP_USER_DAILY_LIMIT - deepUserUsed),
          globalUsed: deepGlobalUsed,
          globalLimit: deepGlobalLimit,
          available:
            deepUserUsed < DEEP_USER_DAILY_LIMIT &&
            deepGlobalAvailable(quota.counts),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
