import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Globe, 
  Brain, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

const STATUS_MESSAGES = [
  "Preparing AI...",
  "Reading your chat history...",
  "Summarizing the fix...",
  "Getting it ready for library...",
  "Saving to your library...",
  "Finalizing..."
];

const PublishingModal = ({ isOpen, isError, isSuccess, articleData, errorMessage, onRetry, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(STATUS_MESSAGES[0]);
  const navigate = useNavigate();

  // Esc closes the modal.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && !isError && !isSuccess) {
      let interval;
      const startProgress = () => {
        interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 98) {
              clearInterval(interval);
              return 98;
            }
            let increment = 0;
            if (prev < 40) increment = Math.random() * 5 + 2; 
            else if (prev < 75) increment = Math.random() * 2 + 0.5;
            else if (prev < 90) increment = Math.random() * 0.5; 
            else increment = 0.1; 
            return Math.min(prev + increment, 98);
          });
        }, 150);
      };
      startProgress();
      return () => clearInterval(interval);
    } else if (isSuccess) {
        setProgress(100);
    }
  }, [isOpen, isError, isSuccess]);

  // Rotate status messages
  useEffect(() => {
    if (isOpen && !isError && !isSuccess) {
      const statusInterval = setInterval(() => {
        setCurrentStatus(prev => {
          const idx = STATUS_MESSAGES.indexOf(prev);
          if (idx < STATUS_MESSAGES.length - 1) return STATUS_MESSAGES[idx + 1];
          return prev;
        });
      }, 3000);
      return () => clearInterval(statusInterval);
    }
  }, [isOpen, isError, isSuccess]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden relative"
        >
          {/* Background Decor */}
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none transition-colors ${isSuccess ? 'bg-emerald-500/20' : isError ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`} />
          
          <div className="p-8 space-y-8 relative z-10 text-center">
            {/* Icon Header */}
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isSuccess ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-110' : isError ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
               {isSuccess ? <CheckCircle2 size={32} /> : isError ? <AlertCircle size={32} /> : <Globe size={32} className="animate-pulse" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter italic dark:text-white">
                {isSuccess ? "Article Published." : isError ? "Something went wrong." : "Saving to Library."}
              </h2>
              <p className="text-[13px] font-medium text-zinc-500 max-w-xs mx-auto">
                {isSuccess ? "Your resolution is now live in the Knowledge Vault." : isError ? (errorMessage || "We couldn't save your article right now.") : "We're uploading your fix to the library for everyone to see."}
              </p>
            </div>

            {/* Success Card or Progress */}
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-left space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">New Library Entry</span>
                </div>
                <h4 className="text-[13px] font-black text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight">
                  {articleData?.title || "Resolution Insight"}
                </h4>
                <button 
                  onClick={() => {
                     onClose();
                     navigate(`/library/${articleData?.slug}`);
                  }}
                  className="w-full py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  View Insight <ArrowRight size={14} />
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                 <div className="relative h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`absolute top-0 left-0 h-full transition-all duration-300 ${isError ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
                    />
                 </div>
                 
                 <div className="flex justify-between items-center px-1">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={isError ? 'err' : currentStatus}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-[10px] font-black uppercase tracking-widest ${isError ? 'text-rose-500' : 'text-zinc-400'}`}
                      >
                         {isError ? "Error" : currentStatus}
                      </motion.span>
                    </AnimatePresence>
                    <span className={`text-[11px] font-black ${isError ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {Math.floor(progress)}%
                    </span>
                 </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4">
              {isError ? (
                <div className="flex gap-3">
                   <button 
                    onClick={onClose}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[11px] font-black uppercase tracking-widest"
                   >
                     Close
                   </button>
                   <button 
                    onClick={onRetry}
                    className="flex-2 py-4 rounded-2xl bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20"
                   >
                     Try Again <Zap size={14} />
                   </button>
                </div>
              ) : isSuccess ? (
                 <button 
                  onClick={onClose}
                  className="text-[11px] font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-colors"
                 >
                   Dismiss
                 </button>
              ) : (
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 italic">
                  You can keep working while we save this.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PublishingModal;
