import React, { useState, useEffect } from "react";
import useDebugStore from "../../store/debugStore";
import { Sparkles, ChevronDown } from "lucide-react";

/**
 * A premium-looking model selector component with glassmorphism styling.
 * Used in both the initial ErrorInput and the subsequent StreamResponse follow-up bar.
 */
const ModelSelector = ({ className = "", position = "down" }) => {
  const { selectedModel, setSelectedModel, quotaCounts, fetchQuota } =
    useDebugStore();
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const models = ["Gemini 3 Flash", "Gemini 2.5 Flash", "Gemma 3 4B", "Gemma 3 12B"];

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const toggleMenu = () => {
    if (!isModelMenuOpen) fetchQuota();
    setIsModelMenuOpen(!isModelMenuOpen);
  };

  const currentCount = quotaCounts[selectedModel] || 0;
  const currentLimit = selectedModel.toLowerCase().startsWith("gemma") ? 14000 : 20;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-2 py-1 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">
          {selectedModel}
        </span>
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span
            className={`text-[8px] font-black tabular-nums ${currentCount >= currentLimit ? "text-rose-500" : "text-zinc-500"}`}
          >
            {currentCount}/{currentLimit}
          </span>
        </div>
        <ChevronDown
          size={10}
          className={`transition-transform duration-300 ${isModelMenuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isModelMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsModelMenuOpen(false)}
          />
          <div className={`absolute left-0 w-56 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            position === "up" ? "bottom-full mb-2 origin-bottom-left" : "top-full mt-2 origin-top-left"
          }`}>
            <div className="p-1.5 space-y-1">
              {models.map((model) => {
                const count = quotaCounts[model] || 0;
                const limit = model.toLowerCase().startsWith("gemma") ? 14000 : 20;
                const isLimitReached = count >= limit;

                return (
                  <button
                    key={model}
                    disabled={isLimitReached}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group/item ${
                      selectedModel === model
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isLimitReached
                          ? "opacity-40 cursor-not-allowed grayscale"
                          : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {model}
                      </span>
                      <span
                        className={`text-[8px] font-bold ${isLimitReached ? "text-rose-500" : "text-zinc-400 dark:text-zinc-600"}`}
                      >
                        {count}/{model.toLowerCase().startsWith("gemma") ? "14000" : "20"} REQUESTS USED
                      </span>
                    </div>
                    {selectedModel === model && !isLimitReached && (
                      <Sparkles size={10} className="text-emerald-500" />
                    )}
                    {isLimitReached && (
                      <div className="text-[8px] font-black text-rose-500 uppercase">
                        Limit
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
