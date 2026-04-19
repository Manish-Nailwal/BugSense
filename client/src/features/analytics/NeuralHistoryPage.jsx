import React, { useEffect, useState } from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import { 
  Archive, 
  Search, 
  ChevronRight, 
  FileText, 
  Calendar,
  Sparkles,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import NeuralReportModal from './NeuralReportModal';

const NeuralHistoryPage = () => {
  const navigate = useNavigate();
  const { neuralHistory, isFetchingHistory, fetchNeuralHistory } = useAnalyticsStore();
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNeuralHistory();
  }, []);

  const historyArray = Array.isArray(neuralHistory) ? neuralHistory : [];

  const filteredHistory = historyArray.filter(report => {
    const contentMatch = report.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const dateStr = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '';
    const dateMatch = dateStr.includes(searchTerm);
    return contentMatch || dateMatch;
  });

  // Premium Markdown Renderers
  const MarkdownComponents = {
    h2: ({ node, ...props }) => (
      <div className="flex items-center gap-2 mb-6 mt-8 first:mt-0 text-zinc-900 dark:text-white">
        <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
        <h2 className="text-xl font-black tracking-tight" {...props} />
      </div>
    ),
    h3: ({ node, children, ...props }) => {
      const content = String(children);
      let icon = <FileText size={18} className="text-purple-500" />;
      
      if (content.includes('Overview')) icon = <Search size={18} className="text-blue-500" />;
      if (content.includes('Patterns')) icon = <AlertCircle size={18} className="text-amber-500" />;
      if (content.includes('Growth')) icon = <TrendingUp size={18} className="text-emerald-500" />;
      if (content.includes('Sprint') || content.includes('Actions')) icon = <Zap size={18} className="text-purple-500" />;

      return (
        <div className="flex items-center gap-3 mt-10 mb-6 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
            {icon}
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight" {...props}>
            {children}
          </h3>
        </div>
      );
    },
    p: ({ node, ...props }) => (
      <p className="text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6 font-medium" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="grid gap-3 mb-8" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 shadow-sm" {...props}>
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
        <span className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium" {...props} />
      </li>
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-black text-purple-600 dark:text-purple-400" {...props} />
    ),
    hr: () => <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-10" />
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 scrollbar-none">
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-500">
              <Sparkles size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Archive Hub</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white italic leading-none">
              Past <span className="text-zinc-300 dark:text-zinc-700">Reports.</span>
            </h1>
            <p className="text-[14px] text-zinc-500 font-medium max-w-md leading-relaxed">
              Browse every summary report generated from your troubleshooting history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input 
                type="text"
                placeholder="Search archive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 text-[13px] font-medium focus:outline-none focus:border-purple-500/50 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-95 group"
            >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
              Generate Summary
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedReport ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-8 pb-24"
            >
              <button 
                onClick={() => setSelectedReport(null)}
                className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-zinc-900 dark:hover:text-white transition-all group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Return to Archive
              </button>

              <div className="relative p-10 rounded-[40px] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/80 shadow-2xl backdrop-blur-sm overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 mb-10 border-b border-zinc-200/50 dark:border-zinc-800/80">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Archive size={20} className="text-white" />
                      </div>
                      <div>
                        <span className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
                          Synthesis ID: {selectedReport._id.slice(-8)}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {new Date(selectedReport.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Intelligence Layer</p>
                      <p className="text-[12px] font-bold text-purple-600 dark:text-purple-400">{selectedReport.model}</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <ReactMarkdown components={MarkdownComponents}>{selectedReport.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {isFetchingHistory ? (
                <div className="py-48 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="animate-spin text-purple-600" size={36} />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Accessing Neural Archive...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-48 text-center space-y-8">
                  <div className="w-20 h-20 rounded-[30px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
                    <Archive className="text-zinc-200 dark:text-zinc-700" size={32} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">Your Memory is Clear.</h3>
                    <p className="text-[14px] text-zinc-500 font-medium max-w-xs mx-auto leading-relaxed">
                      Initialize your project memory by generating your first architectural report synthesis.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2.5 px-8 py-3 bg-purple-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl active:scale-95"
                  >
                    <Sparkles size={16} />
                    Synthesize First Report
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredHistory.map((report) => (
                    <button
                      key={report._id}
                      onClick={() => setSelectedReport(report)}
                      className="w-full text-left bg-white dark:bg-zinc-900/40 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-purple-500/40 hover:bg-purple-50/5 transition-all group flex items-center justify-between shadow-sm active:scale-[0.995]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-11 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                          <FileText size={18} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[15px] font-black text-zinc-900 dark:text-white leading-tight">Neural Report Synthesis</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <span className="text-[10px] font-black text-purple-500/80 uppercase tracking-[0.15em]">
                              {report.model}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NeuralReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default NeuralHistoryPage;
