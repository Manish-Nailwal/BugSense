import {
  genAI,
  MODEL_MAPPING,
  NORMAL_MODEL,
  DEEP_MODEL,
  MAX_TURN_CHARS,
  MAX_SUMMARY_CHARS,
} from "../config/gemini.js";
import { stripMeta, truncateMiddle } from "../utils/text.js";
import { reserveInputTokens, estimateTokens } from "../utils/rateLimiter.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Write to the SSE socket without ever throwing. The client may have
// disconnected (closed tab / lost network); when that happens we must keep
// consuming the model stream to completion and still persist the full reply,
// so a failed write is a no-op rather than something that aborts generation.
export const safeWrite = (res, payload) => {
  try {
    if (!res || res.writableEnded || res.destroyed) return false;
    return res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch {
    return false;
  }
};

// Detect provider rate-limit / quota errors so we can back off.
const isRateLimit = (e) =>
  e?.status === 429 ||
  /(?:^|\b)429\b|RESOURCE_EXHAUSTED|rate.?limit|quota/i.test(e?.message || "");

// Retry a call a couple of times on transient rate-limit errors.
const withRetry = async (fn, retries = 2, baseDelay = 1500) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (isRateLimit(e) && attempt < retries) {
        await sleep(baseDelay * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
};

/**
 * Builds the optional "[USER PERSONALIZATION]" block from saved custom instructions.
 */
const buildPersonalizationBlock = (personalization = {}) => {
  const { aboutYou, responseStyle } = personalization || {};
  const lines = [];
  if (aboutYou && aboutYou.trim()) {
    lines.push(`- About the developer: ${aboutYou.trim()}`);
  }
  if (responseStyle && responseStyle.trim()) {
    lines.push(`- Preferred response style: ${responseStyle.trim()}`);
  }
  if (!lines.length) return "";
  return `\n\n[USER PERSONALIZATION — honour these when not in conflict with safety/accuracy]\n${lines.join("\n")}`;
};

/**
 * Streams debug analysis from Gemini AI using Server-Sent Events (SSE)
 * @param {string} errorLog - The raw error log or follow-up message
 * @param {Object} res - Express response object
 * @param {Array} history - Optional conversation history
 * @param {Object} options - { deepMode, personalization }
 */
export const streamDebugAnalysis = async (
  errorLog,
  res,
  history = [],
  options = {},
) => {
  const { deepMode = false, personalization = {}, modelName, contextSummary = "" } = options;
  const isFollowUp = history.length > 0;

  // The exact model is decided by the controller (it handles Deep-Mode fallback).
  // Fall back to sensible defaults if not provided.
  const resolvedName = modelName || (deepMode ? DEEP_MODEL : NORMAL_MODEL);
  const modelId = MODEL_MAPPING[resolvedName] || MODEL_MAPPING[NORMAL_MODEL];

  // Response mode shapes how solutions are delivered.
  const responseMode =
    personalization?.responseMode === "direct" ? "direct" : "socratic";

  const solutionRule =
    responseMode === "direct"
      ? `- DELIVERY: Be a clear Explainer. Explain the error plainly, then give concrete, actionable guidance and example fixes (code snippets are welcome).`
      : `- DELIVERY: Be Socratic. Guide with questions and mental models; lead the developer toward the fix. DO NOT hand over the full final code solution outright — nudge them to it.`;

  const depthRule = deepMode
    ? `- DEPTH: DEEP ANALYSIS MODE is ON. Be exhaustive: rank multiple hypotheses by likelihood, trace the full root cause, and lay out a complete, verifiable resolution path.`
    : `- DEPTH: Be focused and efficient. Prioritise the single most-likely cause and the fastest path to clarity.`;

  // The metadata trailer is only needed on the FIRST message (for the chat
  // title/category). Follow-ups skip it so replies stay clean.
  const metaBlock = !isFollowUp
    ? `

REQUIRED — after your reply, you MUST append this exact block on its own lines (it is hidden from the user and only used to label the chat). Never omit it:
__JSON_META__
{
  "title": "A concise 3-6 word title for this conversation in Title Case (no quotes, no trailing punctuation)",
  "category": "High-level tech category (e.g., Greeting, Architecture, Logic Error)",
  "techStack": ["Relevant", "Tech"]
}
__JSON_META__`
    : "";

  const systemInstruction = `You are Trace, a senior engineering mentor who helps developers truly understand and fix their code.

HOW TO RESPOND — this matters most:
- Adapt to the message. There is NO fixed template. Lead with whatever is most useful and write so it's genuinely pleasant and easy to read.
- A greeting, a simple question, or a conceptual discussion → just answer naturally and conversationally. No headings, no checklists, no ceremony.
- A real error, stack trace, or log → open with a one- or two-sentence, plain-English explanation of what's actually going wrong, then walk through the most likely root cause and how to confirm it. Reach for a short heading or a checklist ONLY when it genuinely makes a longer answer easier to scan — never impose a rigid multi-section layout on a small problem.
- Format for readability: **bold** key terms, \`inline code\` for identifiers/paths/values, and fenced code blocks for snippets. Keep paragraphs short (2–3 sentences) with breathing room between ideas.

[TONE]
- Calm, encouraging, and precise — sound like a thoughtful senior engineer, not a form.
${solutionRule}
${depthRule}${metaBlock}${buildPersonalizationBlock(personalization)}`;

  // Older turns (beyond the live window) arrive as a rolling summary.
  const summaryBlock =
    contextSummary && contextSummary.trim()
      ? `\n\n[CONVERSATION SUMMARY SO FAR — older turns, for background]\n${truncateMiddle(contextSummary.trim(), MAX_SUMMARY_CHARS)}\nThe messages in the live conversation are the most recent and authoritative.`
      : "";

  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: systemInstruction + summaryBlock,
  });

  // Native multi-turn: map prior turns to Gemini roles (assistant -> model),
  // strip meta blocks, truncate oversized turns (keep input-token cost bounded),
  // and make sure history starts on a user turn.
  const mappedHistory = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: truncateMiddle(stripMeta(m.content), MAX_TURN_CHARS) || "(omitted)" }],
  }));
  while (mappedHistory.length && mappedHistory[0].role !== "user") {
    mappedHistory.shift();
  }

  const chat = model.startChat({ history: mappedHistory });

  let fullText = "";
  try {
    // Retry once or twice if the provider itself rate-limits us.
    const result = await withRetry(() => chat.sendMessageStream(errorLog));

    try {
      for await (const chunk of result.stream) {
        if (!chunk) continue;
        const chunkText = chunk.text();
        if (chunkText) {
          // Always accumulate the full reply (this is what gets persisted).
          // The write may silently no-op if the client has gone away — we keep
          // draining the model stream so the saved answer is complete.
          fullText += chunkText;
          safeWrite(res, { chunk: chunkText });
        }
      }
    } catch (streamError) {
      console.error("Internal Stream Error:", streamError);
      safeWrite(res, { error: "AI_STREAM_INTERRUPTED", message: "The AI stream was interrupted." });
      // We don't re-throw here to allow the function to return whatever it gathered so far
    }

    let metadata = {};
    if (!isFollowUp) {
      const jsonMatch = fullText.match(
        /__JSON_META__\s*([\s\S]*?)\s*__JSON_META__/,
      );
      if (jsonMatch) {
        try {
          metadata = JSON.parse(jsonMatch[1]);
        } catch (e) { }
      }
    }

    return { fullText, metadata };
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    const rateLimited = isRateLimit(error);
    safeWrite(res, {
      error: rateLimited ? "RATE_LIMITED" : "AI_STREAM_ERROR",
      message: rateLimited
        ? "Trace is busy right now (rate limited). Please retry in a few seconds."
        : error.message,
    });
    throw error;
  }
};

/**
 * Folds a batch of older turns into the running context summary.
 * Preserves the exact technical details a debugging chat depends on.
 * @returns {Promise<string>} the updated summary (falls back to prev on failure)
 */
export const summarizeConversation = async (
  turns = [],
  prevSummary = "",
  modelName = NORMAL_MODEL,
) => {
  const transcript = turns
    .map((m) => `${m.role.toUpperCase()}: ${truncateMiddle(stripMeta(m.content), MAX_TURN_CHARS)}`)
    .join("\n\n");

  // Only short-circuit when mocking is explicitly enabled.
  if (process.env.MOCK_AI === "true") {
    return [prevSummary, transcript].filter(Boolean).join("\n\n").slice(0, MAX_SUMMARY_CHARS);
  }

  const prompt = `You maintain a running technical context summary of a DEBUGGING conversation so it can continue without re-reading the old turns.

RULES:
- PRESERVE exact error messages, stack traces, file/function names, code identifiers, versions, and any facts the user confirmed.
- Keep it concise but technically precise. Note what was tried and what the current hypothesis is.
- Output ONLY the updated summary text (no preamble).

EXISTING SUMMARY:
${prevSummary || "(none yet)"}

NEW TURNS TO FOLD IN:
${transcript}`;

  // Self-throttle against the input-token budget; skip (keep old summary) if tight.
  const reservation = reserveInputTokens(estimateTokens(prompt));
  if (!reservation.ok) return prevSummary;

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_MAPPING[modelName] || MODEL_MAPPING[NORMAL_MODEL],
    });
    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();
    return truncateMiddle(text, MAX_SUMMARY_CHARS) || prevSummary;
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return prevSummary; // non-fatal: keep the old summary
  }
};
