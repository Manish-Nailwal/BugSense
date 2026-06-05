import { INPUT_TPM_BUDGET } from "../config/gemini.js";

/**
 * In-memory input-token budget (token bucket) so we proactively stay under the
 * API's tokens-per-minute limit instead of relying on the provider's 429s.
 *
 * NOTE: this is per-process. If you ever run multiple server instances behind a
 * load balancer, back this with a shared store (e.g. Redis) instead.
 */
const WINDOW_MS = 60_000;
const CAPACITY = INPUT_TPM_BUDGET;

let tokens = CAPACITY;
let last = Date.now();

const refill = () => {
  const now = Date.now();
  const elapsed = now - last;
  if (elapsed > 0) {
    tokens = Math.min(CAPACITY, tokens + (elapsed / WINDOW_MS) * CAPACITY);
    last = now;
  }
};

/** Rough token estimate (~4 chars per token). */
export const estimateTokens = (...parts) =>
  Math.ceil(parts.filter(Boolean).join("\n").length / 4);

/**
 * Reserve `est` input tokens from the rolling per-minute budget.
 * @returns {{ ok: boolean, retryAfterMs?: number }}
 */
export const reserveInputTokens = (est) => {
  refill();
  const need = Math.max(0, est || 0);
  if (tokens >= need) {
    tokens -= need;
    return { ok: true };
  }
  const deficit = need - tokens;
  const retryAfterMs = Math.ceil((deficit / CAPACITY) * WINDOW_MS);
  return { ok: false, retryAfterMs };
};
