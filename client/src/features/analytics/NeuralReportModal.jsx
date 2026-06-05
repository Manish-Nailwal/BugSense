import React, { useState, useEffect } from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import {
  X, BrainCircuit, Sparkles, RotateCcw, Loader2, FileText, ArrowUpRight, ArrowRight,
  CheckCircle2, Clock, AlertCircle, BookOpen, GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LEVEL = {
  good: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Good time to generate' },
  ok: { text: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Optional refresh' },
  wait: { text: 'text-zinc-400', bg: 'bg-zinc-400/10', icon: Clock, label: 'Maybe wait' },
  limit: { text: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle, label: 'Limit reached' },
};

const fmtDate = (d) =>
  new Date(d || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const NeuralReportModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    summary, neuralReport, neuralHistory,
    isGeneratingReport, generateNeuralReport, fetchNeuralHistory, fetchSummary,
  } = useAnalyticsStore();

  const [error, setError] = useState(null);

  const rs = summary?.reportStatus || {};
  const canGenerate = rs.canGenerate !== false;
  const rec = rs.recommendation || { level: 'good', message: 'Generate an insight report from your activity.' };
  const history = Array.isArray(neuralHistory) ? neuralHistory : [];
  const latest = history[0] || null;
  const hasReport = !!neuralReport || history.length > 0;

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
      fetchNeuralHistory();
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError(rec.message);
      return;
    }
    setError(null);
    try {
      await generateNeuralReport(hasReport);
      await Promise.all([fetchSummary(), fetchNeuralHistory()]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Generation failed');
    }
  };

  const goToReport = (reportId) => {
    onClose();
    navigate('/analytics/reports', reportId ? { state: { reportId } } : undefined);
  };

  if (!isOpen) return null;

  const l = LEVEL[rec.level] || LEVEL.good;
  const LIcon = l.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-[26px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                <BrainCircuit className="text-white" size={18} />
              </div>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 leading-snug max-w-[230px]">
                An AI summary of your debugging activity — and what to study next.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-5 overflow-y-auto scrollbar-thin">
            {isGeneratingReport ? (
              <div className="py-14 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/25 blur-2xl rounded-full animate-pulse scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-500" size={24} />
                  </div>
                </div>
                <p className="text-[12px] font-semibold text-zinc-900 dark:text-white uppercase tracking-widest">Creating report</p>
                <p className="text-[11px] text-zinc-400">Mapping your diagnostic patterns…</p>
              </div>
            ) : (
              <>
                {/* Timing + quota */}
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${l.bg} ${l.text} flex items-center justify-center shrink-0`}>
                      <LIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-semibold uppercase tracking-wider ${l.text}`}>{l.label}</p>
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">{rec.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-700/60 text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                    <span>Today {rs.dailyUsed ?? 0}/{rs.dailyLimit ?? 1}</span>
                    <span>This week {rs.weeklyUsed ?? 0}/{rs.weeklyLimit ?? 2}</span>
                    <span className="ml-auto normal-case tracking-normal">Resets 12:30 PM IST</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isGeneratingReport || !canGenerate}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 text-[13px] font-semibold transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                >
                  {hasReport ? <RotateCcw size={15} /> : <Sparkles size={15} />}
                  {hasReport ? 'Regenerate report' : 'Generate report'}
                </button>

                {/* Featured latest report */}
                {latest && (
                  <button
                    onClick={() => goToReport(latest._id)}
                    className="w-full text-left group rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] dark:bg-purple-500/[0.06] p-5 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-500">
                        <Sparkles size={11} /> Latest report
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open <ArrowUpRight size={12} />
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">{fmtDate(latest.createdAt)}</p>
                    <div className="flex items-center gap-3 mt-2.5 text-[10px] font-medium text-zinc-500 flex-wrap">
                      {latest.statsSnapshot?.topCategory && (
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 uppercase tracking-wide text-zinc-500">{latest.statsSnapshot.topCategory}</span>
                      )}
                      <span>{latest.statsSnapshot?.confirmedFixes ?? 0} fixes</span>
                      {latest.learningPaths?.length > 0 && (
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {latest.learningPaths.length}</span>
                      )}
                      {latest.skillGaps?.length > 0 && (
                        <span className="flex items-center gap-1"><GraduationCap size={10} /> {latest.skillGaps.length}</span>
                      )}
                    </div>
                  </button>
                )}

                {/* Earlier — compact list */}
                {history.length > 1 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Earlier</p>
                      <button
                        onClick={() => goToReport()}
                        className="flex items-center gap-1 text-[10px] font-semibold text-purple-500 hover:text-purple-400 uppercase tracking-wider transition-colors group"
                      >
                        View all <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                    {history.slice(1, 4).map((r) => (
                      <button
                        key={r._id}
                        onClick={() => goToReport(r._id)}
                        className="w-full flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-200 truncate">{fmtDate(r.createdAt)}</p>
                            {r.statsSnapshot?.topCategory && (
                              <p className="text-[10px] text-zinc-400 truncate">{r.statsSnapshot.topCategory}</p>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight size={13} className="text-zinc-300 dark:text-zinc-600 group-hover:text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {!latest && history.length === 0 && (
                  <p className="text-center text-[11px] text-zinc-400 py-2">No reports yet — generate your first to see insights and a learning path.</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NeuralReportModal;
