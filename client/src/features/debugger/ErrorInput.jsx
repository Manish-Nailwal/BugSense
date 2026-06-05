import React from "react";
import useDebugStore from "../../store/debugStore";
import { Send, Zap } from "lucide-react";
import AttachMenu, { ModeBadge } from "./AttachMenu";
import { MAX_INPUT_CHARS, INPUT_WARN_AT } from "../../config/limits";

/**
 * Claude/ChatGPT-style composer. Compact when empty, grows as you type.
 * Model is auto-selected; the "+" menu adds context / toggles Deep Mode.
 */
const ErrorInput = () => {
  const {
    errorInput,
    setErrorInput,
    isStreaming,
    startAnalysis,
    deepMode,
    quota,
  } = useDebugStore();

  // Standard mode gates on the shared daily pool; Deep Mode has its own allowance.
  const blocked = !deepMode && quota?.normal && !quota.normal.available;
  const canSend = !!errorInput.trim() && !isStreaming && !blocked;

  const handleSend = () => {
    if (canSend) startAnalysis();
  };

  const handleAttach = (text) => {
    const combined = errorInput ? `${errorInput}\n\n${text}` : text;
    setErrorInput(combined.slice(0, MAX_INPUT_CHARS));
  };

  const nearLimit = errorInput.length >= INPUT_WARN_AT;

  return (
    <div
      className={`flex flex-col w-full rounded-[26px] border bg-[#fafafa] dark:bg-[#151517] shadow-sm transition-colors p-2 ${
        deepMode
          ? "border-amber-500/40"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Input */}
      <textarea
        value={errorInput}
        onChange={(e) => setErrorInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Describe a bug, or paste an error / stack trace…"
        disabled={isStreaming}
        maxLength={MAX_INPUT_CHARS}
        rows={1}
        className="w-full bg-transparent text-[15px] resize-none focus:outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-relaxed px-3 pt-2.5 pb-1.5 min-h-[44px] max-h-[220px] overflow-y-auto scrollbar-thin"
        style={{ height: "auto" }}
        onInput={(e) => {
          e.target.style.height = "auto";
          // Grow up to ~9 lines, then scroll inside instead of growing forever.
          e.target.style.height = Math.min(e.target.scrollHeight, 220) + "px";
        }}
      />

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        <AttachMenu position="up" onAttachText={handleAttach} />

        <div className="flex items-center gap-2.5">
          {nearLimit && (
            <span
              className={`text-[10px] font-semibold tabular-nums tracking-wide ${
                errorInput.length >= MAX_INPUT_CHARS ? "text-rose-500" : "text-amber-500"
              }`}
            >
              {errorInput.length}/{MAX_INPUT_CHARS}
            </span>
          )}

          <ModeBadge />

          <button
            onClick={handleSend}
            disabled={!canSend}
            data-tooltip={blocked ? "Daily limit reached — resets at 12:30 PM IST" : "Send"}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm disabled:opacity-25 disabled:cursor-not-allowed ${
              deepMode
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500"
                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90"
            }`}
          >
            {isStreaming ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950 rounded-full animate-spin" />
            ) : deepMode ? (
              <Zap size={16} className="fill-current" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorInput;
