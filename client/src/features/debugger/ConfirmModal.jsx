import React, { useState, useEffect } from "react";
import useDebugStore from "../../store/debugStore";
import useAuthStore from "../../store/authStore";
import { CheckCircle2, X, Globe, ArrowRight, BadgeCheck, Ghost } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sessionTitle = (s) => {
  if (s?.title) return s.title;
  const first = (s?.rawError || "").split("\n")[0] || "this conversation";
  return first.replace(/^(Uncaught\s+)?(TypeError|ReferenceError|Error|SyntaxError):\s*/i, "").slice(0, 60) || "this conversation";
};

const ConfirmModal = ({ isOpen, onClose, sessionId, onConfirm }) => {
  const { pastSessions } = useDebugStore();
  const { user } = useAuthStore();
  const [userNote, setUserNote] = useState("");
  const [shouldPublish, setShouldPublish] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentSession = pastSessions.find(s => s._id === sessionId);
  const firstName = user?.displayName?.trim().split(" ")[0] || "You";

  // Default the identity choice to the user's saved preference each open.
  useEffect(() => {
    if (isOpen) setAnonymous(user?.preferences?.defaultBlogIdentity === "anonymous");
  }, [isOpen, user]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(userNote, shouldPublish, anonymous ? "anonymous" : "name");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[26px] shadow-2xl overflow-hidden relative"
        >
          <div className="p-6 space-y-5 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Fix Verification</span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Verify your <span className="text-emerald-500">solution</span>
                </h2>
                <p className="text-[12.5px] text-zinc-500 leading-relaxed">
                  Marking <span className="font-medium text-zinc-700 dark:text-zinc-300">"{sessionTitle(currentSession)}"</span> as resolved.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Fix note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 ml-0.5">How did you fix it? <span className="text-zinc-400 font-normal">(optional)</span></label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Briefly describe your fix…"
                className="w-full h-20 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 text-[13.5px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 scrollbar-thin"
              />
            </div>

            {/* Publish toggle */}
            <button
              onClick={() => setShouldPublish(!shouldPublish)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${shouldPublish ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-transparent border-zinc-200 dark:border-zinc-800'}`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${shouldPublish ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    <Globe size={16} />
                 </div>
                 <div className="text-left">
                    <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Publish to Library</p>
                    <p className="text-[11px] text-zinc-500">Share this fix publicly.</p>
                 </div>
              </div>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${shouldPublish ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                 <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${shouldPublish ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Identity choice — only matters when publishing */}
            {shouldPublish && (
              <div className="flex items-center justify-between gap-3 px-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">Publish as</p>
                  <p className="text-[10.5px] text-zinc-500">How you appear on the blog.</p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70">
                  <button
                    onClick={() => setAnonymous(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${!anonymous ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                  >
                    <BadgeCheck size={13} /> {firstName}
                  </button>
                  <button
                    onClick={() => setAnonymous(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${anonymous ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                  >
                    <Ghost size={13} /> Anonymous
                  </button>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-3 pt-1">
               <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[12px] font-semibold hover:text-zinc-900 dark:hover:text-white transition-all active:scale-[0.98]"
               >
                 Cancel
               </button>
               <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-[2] py-3.5 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[12px] font-semibold tracking-wide hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
               >
                 {isLoading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-zinc-950/30 dark:border-t-zinc-950 rounded-full animate-spin" />
                 ) : (
                   <>Confirm fix <ArrowRight size={14} /></>
                 )}
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
