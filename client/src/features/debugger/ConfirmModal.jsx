import React, { useState } from "react";
import useDebugStore from "../../store/debugStore";
import { 
  CheckCircle2, 
  X, 
  MessageSquare, 
  Globe, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmModal = ({ isOpen, onClose, sessionId, onConfirm }) => {
  const { pastSessions } = useDebugStore();
  const [userNote, setUserNote] = useState("");
  const [shouldPublish, setShouldPublish] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const currentSession = pastSessions.find(s => s._id === sessionId);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(userNote, shouldPublish);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden relative"
        >
          {/* Neural Background Decor */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none" />
          
          <div className="p-8 md:p-10 space-y-8 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Fix Verification</span>
                </div>
                <h2 className="text-2xl font-[1000] tracking-tighter text-zinc-900 dark:text-white italic">
                  Verify your <span className="text-emerald-500">Solution.</span>
                </h2>
                <p className="text-[13px] font-medium text-zinc-500 max-w-sm leading-relaxed">
                  Tag this error as resolved and share your process with the community.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 transition-all active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
 
            {/* Context Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap size={10} className="text-zinc-400" />
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.1em]">The Problem</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500 line-clamp-2 leading-tight">
                    {currentSession?.rawError || "Loading session..."}
                  </p>
               </div>
               <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.1em]">Verified Fix</span>
                  </div>
                  <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-tight">
                    {currentSession?.messages?.[currentSession.messages.length - 1]?.content.substring(0, 150) || "Analyzing fix..."}
                  </p>
               </div>
            </div>
 
            {/* Input Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">How did you fix it?</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <textarea 
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Briefly describe your fix..."
                    className="w-full h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all relative z-10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shrink-0"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest italic">Optional field</p>
                   {userNote.length > 0 && (
                     <span className={`text-[9px] font-black text-emerald-500`}>
                       {userNote.length} CHRS
                     </span>
                   )}
                </div>
              </div>
 
              {/* Publish Toggle */}
              <button 
                onClick={() => setShouldPublish(!shouldPublish)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${shouldPublish ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-transparent border-zinc-200 dark:border-zinc-800'}`}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl transition-all ${shouldPublish ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                      <Globe size={16} />
                   </div>
                   <div className="text-left">
                      <p className="text-[13px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Public Verification</p>
                      <p className="text-[10px] font-medium text-zinc-500">Share with the Knowledge Vault.</p>
                   </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${shouldPublish ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${shouldPublish ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>
 
            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
               <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[11px] font-black uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
               >
                 Cancel
               </button>
               <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-[2] py-4 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-20"
               >
                 {isLoading ? (
                   <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>Confirm Fix <ArrowRight size={14} /></>
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
