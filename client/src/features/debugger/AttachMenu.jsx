import React, { useState, useRef, useEffect } from "react";
import useDebugStore from "../../store/debugStore";
import { Plus, FileUp, Zap, Sparkles } from "lucide-react";

const MAX_ATTACH_CHARS = 6000;
const ACCEPTED =
  ".log,.txt,.json,.js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.rb,.php,.c,.cpp,.cs,.md,.yml,.yaml,.env,.sh,text/*";

/**
 * The "+" menu used in both input bars (Claude/ChatGPT style):
 *  - Attach a log file (reads its text into the prompt)
 *  - Toggle Deep Mode (premium model, 1 request / user / day)
 *
 * @param {('up'|'down')} position - drop direction
 * @param {(text: string) => void} onAttachText - receives the file's text content
 */
const AttachMenu = ({ position = "up", onAttachText }) => {
  const { deepMode, setDeepMode, quota, fetchQuota } = useDebugStore();
  const [isOpen, setIsOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // Esc closes the dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const deep = quota?.deep || {};
  const deepAvailable = !!deep.available;
  const remaining = deep.remaining ?? 0;
  // The user can always turn Deep Mode OFF; turning it ON requires availability.
  const canEnableDeep = deepAvailable || deepMode;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    try {
      const text = await file.text();
      const trimmed = text.slice(0, MAX_ATTACH_CHARS);
      const header = `--- ${file.name} ---\n`;
      onAttachText?.(header + trimmed);
    } catch {
      // Binary / unreadable file — silently ignore.
    } finally {
      setIsOpen(false);
    }
  };

  const toggleDeep = () => {
    if (!canEnableDeep) return; // exhausted for today
    setDeepMode(!deepMode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        data-tooltip="Add context"
        className={`p-2 rounded-full transition-all ${
          isOpen
            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        <Plus
          size={20}
          className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute left-0 w-64 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800 rounded-2xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              position === "up"
                ? "bottom-full mb-2.5 origin-bottom-left"
                : "top-full mt-2.5 origin-top-left"
            }`}
          >
            <div className="p-1.5 space-y-0.5">
              {/* Attach log file */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false); // close the menu as the OS picker opens
                  fileRef.current?.click();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors shrink-0">
                  <FileUp size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
                    Attach log file
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                    .log .txt .json .js …
                  </span>
                </div>
              </button>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 mx-2 my-0.5" />

              {/* Deep Mode toggle */}
              <button
                type="button"
                onClick={toggleDeep}
                disabled={!canEnableDeep}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  !canEnableDeep
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    deepMode
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  <Zap size={15} className={deepMode ? "fill-white" : ""} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-100">
                    Deep Mode
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {!canEnableDeep
                      ? "Used today · resets 12:30 PM IST"
                      : `Advanced model · ${remaining} left today`}
                  </span>
                </div>
                {/* Switch */}
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    deepMode ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      deepMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttachMenu;

/**
 * Small inline pill that shows the active mode beside the send button.
 */
export const ModeBadge = () => {
  const { deepMode } = useDebugStore();
  return (
    <span
      data-tooltip={deepMode ? "Deep Mode — advanced model" : "Trace picks the best model automatically"}
      className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border transition-colors ${
        deepMode
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-zinc-200 dark:border-zinc-700/60 bg-zinc-100/70 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400"
      }`}
    >
      {deepMode ? (
        <>
          <Zap size={10} className="fill-current" /> Deep
        </>
      ) : (
        <>
          <Sparkles size={10} /> Auto
        </>
      )}
    </span>
  );
};
