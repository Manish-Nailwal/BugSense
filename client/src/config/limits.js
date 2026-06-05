// Max characters allowed in a single composer message (ChatGPT-style cap).
// Chosen to stay well under the server body limit and keep input-token cost
// per request bounded (~8k chars ≈ ~2k tokens).
export const MAX_INPUT_CHARS = 8000;

// Soft threshold where we start surfacing the character counter as a warning.
export const INPUT_WARN_AT = Math.floor(MAX_INPUT_CHARS * 0.9);
