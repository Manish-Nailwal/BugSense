import React from "react";
import useDebugStore from "../../store/debugStore";
import { Plus, Send, Activity } from "lucide-react";
import ModelSelector from "./ModelSelector";

/**
 * Ultra-compact Claude/ChatGPT style input component.
 */
const ErrorInput = () => {
  const { 
    errorInput, 
    setErrorInput, 
    isStreaming, 
    startAnalysis, 
    sessionId,
    selectedModel,
    quotaCounts
  } = useDebugStore();

  const currentLimit = selectedModel.startsWith("Gemma") ? 14000 : 20;
  const isLimitReached = (quotaCounts[selectedModel] || 0) >= currentLimit;

  const handleSend = () => {
    if (!isLimitReached) startAnalysis();
  };

  return (
    <div className="flex flex-col w-full bg-[#f9f9f9] dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-[28px] focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all p-2 shadow-sm">
      {/* TextArea Area */}
      <div className="relative flex flex-col px-4 pt-4 pb-1">
        <textarea
          value={errorInput}
          onChange={(e) => setErrorInput(e.target.value)}
          placeholder="Paste your system logs or error messages here..."
          disabled={isStreaming}
          rows={1}
          className="w-full bg-transparent font-sans text-[15px] resize-none focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-relaxed min-h-[60px] max-h-[400px] scrollbar-none"
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
      </div>

      {/* Bottom Controls Area */}
      <div className="flex items-center justify-between px-2 pb-1">
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
             {/* Character Count - Minimalist */}
             {errorInput.length > 0 && (
               <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 tabular-nums uppercase tracking-widest mr-2">
                 {errorInput.length} / 5000
               </span>
             )}
             
             {/* Model Selector - Positioned like Claude */}
             <ModelSelector />
          </div>

          <button
            onClick={handleSend}
            disabled={isStreaming || !errorInput.trim() || isLimitReached}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center shadow-md active:scale-95 disabled:opacity-20 disabled:grayscale ${
              sessionId
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10"
            }`}
          >
            {isStreaming ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorInput;
