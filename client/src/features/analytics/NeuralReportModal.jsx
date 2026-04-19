import React, { useState, useEffect } from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import useDebugStore from '../../store/debugStore';
import {
  X, Sparkles, Loader2, BrainCircuit, RotateCcw,
  History, FileText, Calendar, ChevronRight,
  ArrowLeft, ArrowRight, Cpu, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import ModelSelector from '../debugger/ModelSelector';
import { useNavigate } from 'react-router-dom';

const QUOTA_LIMIT = 20;

const NeuralReportModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    summary, neuralReport, neuralHistory, quotaCounts,
    isGeneratingReport, isFetchingHistory,
    generateNeuralReport, fetchNeuralHistory, fetchQuota
  } = useAnalyticsStore();
  const { selectedModel } = useDebugStore();

  const [error, setError] = useState(null);
  const [view, setView] = useState('current');
  const [selectedHistoryReport, setSelectedHistoryReport] = useState(null);
  // 'card' | 'reader' | 'regenerate'
  const [currentMode, setCurrentMode] = useState('card');

  // Server returns keys with dots (e.g. "Gemini 2.5 Flash") — use model name directly
  const modelKey = selectedModel;
  const modelUsed = quotaCounts?.[modelKey] ?? 0;
  const quotaPercent = Math.min((modelUsed / QUOTA_LIMIT) * 100, 100);
  const quotaColor = modelUsed >= QUOTA_LIMIT ? 'text-red-500' : modelUsed > 15 ? 'text-amber-500' : 'text-emerald-500';
  const barColor = modelUsed >= QUOTA_LIMIT ? 'bg-red-500' : modelUsed > 15 ? 'bg-amber-500' : 'bg-emerald-500';

  const reportDate = summary?.neuralReport?.generatedAt;
  const reportModel = summary?.neuralReport?.model;

  useEffect(() => {
    if (isOpen) {
      fetchQuota();
      setCurrentMode('card');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && view === 'history') {
      fetchNeuralHistory();
    }
  }, [isOpen, view]);

  const handleGenerate = async (force = false) => {
    if (modelUsed >= QUOTA_LIMIT) {
      setError(`Daily limit (${QUOTA_LIMIT}) reached for ${selectedModel}. Try again tomorrow or switch models.`);
      return;
    }
    setError(null);
    try {
      await generateNeuralReport(selectedModel, force);
      await fetchQuota();
      setCurrentMode('card');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Generation failed');
    }
  };

  if (!isOpen) return null;

  /* ── Shared: Quota Bar ── */
  const QuotaBar = () => (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${quotaPercent}%` }}
        />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${quotaColor}`}>
        {modelUsed} / {QUOTA_LIMIT}
      </span>
    </div>
  );

  /* ── Shared: Report history row card ── */
  const ReportRowCard = ({ report, onClick }) => (
    <button
      onClick={onClick}
      className="w-full p-4 text-left bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/60 rounded-2xl hover:border-purple-400/50 dark:hover:border-purple-500/40 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-purple-500 transition-colors">
          <FileText size={17} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-zinc-900 dark:text-white leading-tight">Report Synthesis</p>
          <p className="text-[10px] font-semibold text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <Calendar size={9} className="shrink-0"/>
            {new Date(report.createdAt || report.generatedAt).toLocaleDateString()}&nbsp;&nbsp;•&nbsp;&nbsp;
            <span className="text-purple-400">{(report.model || selectedModel)?.toUpperCase()}</span>
          </p>
        </div>
      </div>
      <ChevronRight size={15} className="text-zinc-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BrainCircuit className="text-white" size={19} />
            </div>
            <div>
              <h3 className="text-[16px] font-black tracking-tight text-zinc-900 dark:text-white leading-none">System Analysis</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                {['current', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setView(tab);
                      setSelectedHistoryReport(null);
                      if (tab === 'current') setCurrentMode('card');
                    }}
                    className={`text-[9px] font-black uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg transition-all ${
                      view === tab
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
          <AnimatePresence mode="wait">

            {/* ═══════════ HISTORY TAB ═══════════ */}
            {view === 'history' ? (
              <motion.div
                key={selectedHistoryReport ? 'hist-detail' : 'hist-list'}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                {selectedHistoryReport ? (
                  <div className="space-y-5">
                    <button
                      onClick={() => setSelectedHistoryReport(null)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft size={12} /> Archive
                    </button>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock size={12} />
                        <span className="text-[11px] font-bold">
                          {new Date(selectedHistoryReport.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2.5 py-1 rounded-lg">
                        {selectedHistoryReport.model}
                      </span>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-[13.5px] prose-p:leading-relaxed prose-strong:text-purple-600 prose-strong:font-black prose-headings:font-black">
                      <ReactMarkdown>{selectedHistoryReport.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Diagnostic Archive</span>
                      <button
                        onClick={() => { onClose(); navigate('/analytics/reports'); }}
                        className="flex items-center gap-1 text-[10px] font-bold text-purple-500 hover:text-purple-400 uppercase tracking-widest transition-colors group"
                      >
                        Full Archive <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {isFetchingHistory ? (
                      <div className="py-16 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-zinc-300" size={24} />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading archive...</p>
                      </div>
                    ) : neuralHistory.length === 0 ? (
                      <div className="py-14 text-center space-y-3">
                        <History className="mx-auto text-zinc-200 dark:text-zinc-700" size={36} />
                        <p className="text-[12px] font-medium text-zinc-400">No archived reports yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {neuralHistory.map((r) => (
                          <ReportRowCard key={r._id} report={r} onClick={() => setSelectedHistoryReport(r)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

            /* ═══════════ CURRENT: EMPTY ═══════════ */
            ) : !neuralReport && !isGeneratingReport ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 pt-2">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-purple-500" size={24} />
                  </div>
                  <h4 className="text-[16px] font-black text-zinc-900 dark:text-white tracking-tight">Create your debugging summary</h4>
                  <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Our AI analyzes your session history, error patterns, and resolution speed to build a personalized summary report.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Cpu size={13} />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Model</span>
                    </div>
                    <ModelSelector />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Daily Quota</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${quotaColor}`}>{modelUsed}/{QUOTA_LIMIT} used</span>
                    </div>
                    <QuotaBar />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGeneratingReport || modelUsed >= QUOTA_LIMIT}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center gap-2.5 text-[13px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                >
                  <Sparkles size={15} />
                  Generate Summary Report
                </button>
              </motion.div>

            /* ═══════════ CURRENT: LOADING ═══════════ */
            ) : isGeneratingReport ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-16 flex flex-col items-center justify-center space-y-5"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse scale-150" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-500/20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-500" size={28} />
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.18em]">Creating Report</p>
                  <p className="text-[11px] text-zinc-400 font-medium">AI is mapping your diagnostic patterns...</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>

            /* ═══════════ CURRENT: REGENERATE PANEL ═══════════ */
            ) : currentMode === 'regenerate' ? (
              <motion.div
                key="regenerate"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <button
                  onClick={() => setCurrentMode('card')}
                  className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={12} /> Back
                </button>

                <div className="text-center space-y-1.5">
                  <h4 className="text-[15px] font-black text-zinc-900 dark:text-white tracking-tight">Renew Analysis</h4>
                  <p className="text-[12px] text-zinc-500 max-w-xs mx-auto">Choose your model and generate a fresh report using today's activity.</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Cpu size={13} />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Model</span>
                    </div>
                    <ModelSelector />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Daily Quota — {selectedModel}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${quotaColor}`}>{modelUsed}/{QUOTA_LIMIT} used</span>
                    </div>
                    <QuotaBar />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => handleGenerate(true)}
                  disabled={isGeneratingReport || modelUsed >= QUOTA_LIMIT}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center gap-2.5 text-[13px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                >
                  <RotateCcw size={15} />
                  Regenerate Now
                </button>
              </motion.div>

            /* ═══════════ CURRENT: READER ═══════════ */
            ) : currentMode === 'reader' ? (
              <motion.div
                key="reader"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMode('card')}
                    className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                  <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-purple-400">{reportModel || selectedModel}</span>
                    {reportDate && <span className="text-zinc-400">{new Date(reportDate).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none
                  prose-p:text-[13.5px] prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400
                  prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-black prose-headings:tracking-tight
                  prose-headings:mt-7 first:prose-headings:mt-0
                  prose-strong:text-purple-600 dark:prose-strong:text-purple-400 prose-strong:font-black
                  prose-hr:border-zinc-100 dark:prose-hr:border-zinc-800"
                >
                  <ReactMarkdown>{neuralReport}</ReactMarkdown>
                </div>
              </motion.div>

            /* ═══════════ CURRENT: SUMMARY CARD ═══════════ */
            ) : (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* The compact report row card */}
                <ReportRowCard
                  report={{ createdAt: reportDate || new Date(), model: reportModel || selectedModel }}
                  onClick={() => setCurrentMode('reader')}
                />

                {/* Status + actions bar */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentMode('regenerate')}
                      className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 hover:text-purple-500 uppercase tracking-widest transition-colors"
                    >
                      <RotateCcw size={10} /> Regenerate
                    </button>
                    <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
                    <button
                      onClick={() => { onClose(); navigate('/analytics/reports'); }}
                      className="flex items-center gap-1 text-[10px] font-black text-purple-500 hover:text-purple-400 uppercase tracking-widest transition-colors group"
                    >
                      Archive <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${quotaColor}`}>
                      {modelUsed}/{QUOTA_LIMIT}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default NeuralReportModal;
