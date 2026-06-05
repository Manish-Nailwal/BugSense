import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mapping friendly names to Google AI model identifiers
export const MODEL_MAPPING = {
  "Gemini 3 Flash": "gemini-3-flash-preview",
  "Gemini 2.5 Flash": "gemini-2.5-flash",
  "Gemini 3 Flash Lite": "gemini-3.1-flash-lite",
};

/**
 * Tier strategy (free tier):
 * - NORMAL_MODEL  -> used silently for every standard request (large daily pool).
 * - DEEP_MODEL    -> the stronger model, gated behind "Deep Mode".
 * The model is now chosen server-side; users no longer pick it manually.
 */
export const NORMAL_MODEL = "Gemini 3 Flash Lite";
export const DEEP_MODEL = "Gemini 3 Flash";
// When the primary Deep model's global pool is exhausted, Deep Mode falls back here.
export const DEEP_FALLBACK_MODEL = "Gemini 2.5 Flash";

// Quota Map keys store friendly names with dots replaced by underscores.
export const NORMAL_MODEL_KEY = NORMAL_MODEL.replace(/\./g, "_");
export const DEEP_MODEL_KEY = DEEP_MODEL.replace(/\./g, "_");
export const DEEP_FALLBACK_MODEL_KEY = DEEP_FALLBACK_MODEL.replace(/\./g, "_"); // "Gemini 2_5 Flash"

// Daily GLOBAL limits (shared API key on the free tier).
export const NORMAL_DAILY_LIMIT = 500; // total shared flash-lite pool
// Hold some of the 500 back so a worst-case rush doesn't lock out essential
// actions (e.g. publishing a resolved fix). Standard chat stops at USABLE;
// publishing may dip into the reserve up to the full limit.
export const NORMAL_DAILY_RESERVE = 50;
export const NORMAL_USABLE_LIMIT = NORMAL_DAILY_LIMIT - NORMAL_DAILY_RESERVE; // 450
export const DEEP_DAILY_LIMIT = 20; // tight premium pool (Gemini 3 Flash), shared by everyone
export const DEEP_FALLBACK_DAILY_LIMIT = 200; // secondary deep pool (Gemini 2.5 Flash)

// Per-USER allowance for Deep Mode each day (independent of which deep model serves it).
export const DEEP_USER_DAILY_LIMIT = 1;

/**
 * Conversation context strategy:
 * - The last CONTEXT_WINDOW messages are always sent to the model verbatim
 *   (recent precision matters most for debugging).
 * - Older messages are folded into a rolling summary, but only once the
 *   conversation grows past SUMMARY_TRIGGER messages (most chats never do).
 * Raw turns are always kept in the DB regardless — the summary is just a
 * prompt-size optimization, never the only memory.
 */
export const CONTEXT_WINDOW = 8; // ~4 recent exchanges kept verbatim
export const SUMMARY_TRIGGER = 10; // start summarizing only beyond this

// Per-piece caps so a single huge paste can't blow the input-token budget.
export const MAX_TURN_CHARS = 4000; // ~1k tokens per windowed turn
export const MAX_SUMMARY_CHARS = 1500; // cap the rolling summary

// API input-token rate limit (tokens-per-minute). We self-throttle under this.
export const INPUT_TPM_LIMIT = 250000;
export const INPUT_TPM_BUDGET = 240000; // leave margin below the hard limit

/**
 * Picks which model serves a Deep Mode request, given today's global counts.
 * Prefers the premium DEEP_MODEL, then falls back to DEEP_FALLBACK_MODEL.
 * @returns {{ key: string, limit: number } | null} chosen pool, or null if both exhausted.
 */
export const pickDeepModel = (counts) => {
  const deepUsed = counts.get(DEEP_MODEL_KEY) || 0;
  if (deepUsed < DEEP_DAILY_LIMIT) {
    return { key: DEEP_MODEL_KEY, name: DEEP_MODEL, limit: DEEP_DAILY_LIMIT };
  }
  const fallbackUsed = counts.get(DEEP_FALLBACK_MODEL_KEY) || 0;
  if (fallbackUsed < DEEP_FALLBACK_DAILY_LIMIT) {
    return {
      key: DEEP_FALLBACK_MODEL_KEY,
      name: DEEP_FALLBACK_MODEL,
      limit: DEEP_FALLBACK_DAILY_LIMIT,
    };
  }
  return null;
};

/**
 * Returns today's date as YYYY-MM-DD in US Pacific Time.
 * Quotas reset at Pacific midnight (~12:30 PM IST) to match Google's reset window.
 */
export const getQuotaDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// Default export if needed
export default genAI;
