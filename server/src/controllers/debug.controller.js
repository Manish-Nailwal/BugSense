import DebugSession from "../models/DebugSession.model.js";
import User from "../models/User.model.js";
import LibraryArticle from "../models/LibraryArticle.model.js";
import ApiQuota from "../models/ApiQuota.model.js";
import { streamDebugAnalysis } from "../services/gemini.service.js";
import { mockDebugAnalysis } from "../services/mock.service.js";
import { generateArticle } from "../services/article.service.js";

// @desc    Analyze an error and stream response
// @route   POST /api/debug/analyze
// @access  Private
export const analyzeError = async (req, res) => {
  const {
    errorLog,
    history,
    sessionId,
    selectedModel: rawModel = "Gemma 3 12B",
  } = req.body;
  const selectedModel = rawModel.replace(/\./g, "_");

  if (!errorLog) {
    return res
      .status(400)
      .json({ success: false, message: "No error log provided" });
  }

  try {
    // 0. Check and Update Daily Quota (Resets at Midnight Pacific Time)
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    
    // Using findOneAndUpdate with upsert to prevent race conditions
    let quota = await ApiQuota.findOneAndUpdate(
      { date: today },
      { $setOnInsert: { 
          date: today,
          counts: { "Gemini 3 Flash": 0, "Gemini 2_5 Flash": 0, "Gemma 3 4B": 0, "Gemma 3 12B": 0 }
        } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const currentCount = quota.counts.get(selectedModel) || 0;
    const modelLimit = rawModel.toLowerCase().startsWith("gemma") ? 14000 : 20;

    if (currentCount >= modelLimit) {
      return res.status(429).json({
        success: false,
        message: `Daily limit (${modelLimit}) reached for ${rawModel}. Resets at 12:30 PM IST.`,
        code: "QUOTA_EXCEEDED",
      });
    }

    // Increment quota early to prevent race conditions (simplified)
    quota.counts.set(selectedModel, currentCount + 1);
    await quota.save();

    // 1. Initialize SSE Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Handle abrupt client disconnection or stream errors
    res.on("error", (err) => {
      console.error("SSE Response Error:", err);
    });

    const isFollowUp = !!sessionId;
    let activeSessionId = sessionId;

    // 1. If new chat, create session immediately to provide ID for redirection
    if (!isFollowUp) {
      const session = await DebugSession.create({
        userId: req.user._id,
        rawError: errorLog,
        messages: [{ role: "user", content: errorLog }],
        aiResponse: { fullText: "Analyzing..." },
      });
      activeSessionId = session._id;

      // Send immediate ID for frontend redirection
      res.write(
        `data: ${JSON.stringify({ metadata: { sessionId: activeSessionId } })}\n\n`,
      );

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.totalSessions": 1 },
      });
    }

    // 2. Environment-based AI switching
    const service =
      process.env.NODE_ENV === "development" || process.env.MOCK_AI === "true"
        ? mockDebugAnalysis
        : streamDebugAnalysis;

    const { fullText, metadata } = await service(errorLog, res, history || [], rawModel);

    // 3. Persist the interaction
    if (isFollowUp) {
      // Append to existing session
      await DebugSession.findByIdAndUpdate(sessionId, {
        $push: {
          messages: {
            $each: [
              { role: "user", content: errorLog },
              { role: "assistant", content: fullText },
            ],
          },
        },
      });
    } else {
      // Finalize created session
      await DebugSession.findByIdAndUpdate(activeSessionId, {
        $push: { messages: { role: "assistant", content: fullText } },
        "aiResponse.fullText": fullText,
        category: metadata.category || "Unknown",
        techStack: metadata.techStack || [],
      });
    }

    // 4. Finalize the SSE stream
    res.write(
      `data: ${JSON.stringify({
        done: true,
        metadata: { ...metadata, sessionId: activeSessionId },
      })}\n\n`,
    );
    res.end();
  } catch (error) {
    console.error("Analysis Error:", error);
    if (!res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({ error: "SERVER_PROCESS_ERROR", message: error.message })}\n\n`,
      );
      res.end();
    }
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
    const { userNote, selectedModel: rawModel = "Gemma 3 12B", shouldPublish = true } = req.body;
    const { id: sessionId } = req.params;
    const selectedModel = rawModel.replace(/\./g, "_");

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
      // 0. Check and Update Daily Quota (Only if publishing - Resets at Midnight Pacific Time)
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      let quota = await ApiQuota.findOneAndUpdate(
        { date: today },
        { $setOnInsert: { 
            date: today,
            counts: { "Gemini 3 Flash": 0, "Gemini 2_5 Flash": 0, "Gemma 3 4B": 0, "Gemma 3 12B": 0 }
          } 
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const currentCount = quota.counts.get(selectedModel) || 0;
      const modelLimit = rawModel.toLowerCase().startsWith("gemma") ? 14000 : 20;

      if (currentCount >= modelLimit) {
        return res.status(429).json({
          success: false,
          message: `Daily limit (${modelLimit}) reached for ${rawModel}. Resets at 12:30 PM IST.`,
          code: "QUOTA_EXCEEDED",
        });
      }

      // Increment quota
      quota.counts.set(selectedModel, currentCount + 1);
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
        rawModel,
        session.messages,
      );

      // Create Library Article
      const article = await LibraryArticle.create({
        sessionId: session._id,
        authorId: req.user._id,
        slug,
        title: metadata.title,
        metaDescription: metadata.metaDescription,
        content,
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

// @desc    Get current daily quota usage
// @route   GET /api/debug/quota
// @access  Private
export const getQuota = async (req, res) => {
  try {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    
    const quota = await ApiQuota.findOneAndUpdate(
      { date: today },
      { $setOnInsert: { 
          date: today,
          counts: { "Gemini 3 Flash": 0, "Gemini 2_5 Flash": 0, "Gemma 3 4B": 0, "Gemma 3 12B": 0 }
        } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Convert Map to plain object for easier frontend consumption
    const counts = Object.fromEntries(quota.counts);
    
    // We need to map back to dots for the frontend display if stored with underscores
    const displayCounts = {};
    for (const [key, val] of Object.entries(counts)) {
      displayCounts[key.replace(/_/g, '.')] = val;
    }

    res.json({ success: true, data: displayCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
