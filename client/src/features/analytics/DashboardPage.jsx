import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAnalyticsStore from '../../store/analyticsStore';
import CategoryChart from './CategoryChart';
import SkillAlerts from './SkillAlerts';
import LearningRoadmaps from './LearningRoadmaps';
import {
  BarChart3,
  Target,
  Zap,
  RotateCcw,
  LayoutDashboard,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import NeuralReportModal from './NeuralReportModal';
import { MANISH_LABS_URL } from '../../config/links';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { summary, fetchSummary } = useAnalyticsStore();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const rec = summary?.reportStatus?.recommendation;
  const recDot = { good: 'bg-emerald-500', ok: 'bg-amber-500', wait: 'bg-zinc-400', limit: 'bg-rose-500' }[rec?.level] || 'bg-zinc-400';

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const stats = [
    { label: 'Total Sessions', value: summary?.totalSessions ?? 0, icon: BarChart3, color: 'text-blue-500' },
    { label: 'Issues Fixed', value: summary?.confirmedFixes ?? 0, icon: Target, color: 'text-emerald-500' },
    { label: 'Success Rate', value: summary?.efficiency || '0%', icon: Zap, color: 'text-amber-500' },
    { label: 'Top Area', value: summary?.topCategory || 'N/A', icon: BrainCircuit, color: 'text-purple-500' },
  ];

  const categoryStats = summary?.categoryStats || [];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 scrollbar-none">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <LayoutDashboard size={16} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Analytics</span>
            </div>
            <h1 className="text-2xl md:text-[1.8rem] font-semibold tracking-tight">
              Debugging <span className="text-zinc-400 dark:text-zinc-500">insights</span>
            </h1>
            {rec && (
              <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <span className={`w-1.5 h-1.5 rounded-full ${recDot} ${rec.level === 'good' ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{rec.message}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={MANISH_LABS_URL}
              target="_blank"
              rel="noreferrer"
              className="group hidden md:inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Manish Labs
              <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 text-[12px] font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <Sparkles size={15} />
              Summary Report
            </button>
            <div className="relative group/rt flex items-center">
              <button
                onClick={() => fetchSummary(true)}
                aria-label="Recompute analytics"
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                <RotateCcw size={16} />
              </button>
              {/* Custom compact tooltip (matches the sidebar style) */}
              <div className="absolute right-0 top-full mt-2 px-2.5 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-semibold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none -translate-y-1 group-hover/rt:opacity-100 group-hover/rt:translate-y-0 transition-all duration-150 z-[200]">
                Recompute analytics
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                <stat.icon size={15} className={stat.color} />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white truncate">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Insights row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Error types */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Error Types</h3>
              {summary?.neuralReport?.content && (
                <button
                  onClick={() => navigate('/analytics/reports')}
                  className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-purple-500 hover:text-purple-400 transition-colors"
                  data-tooltip="View your past summary reports"
                  data-tip-pos="bottom"
                >
                  Reports <ArrowUpRight size={11} />
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="h-[260px]">
                <CategoryChart data={categoryStats} />
              </div>
              <div className="grid grid-cols-2 gap-2 px-1">
                {categoryStats.slice(0, 4).map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                    <span className="text-[10px] font-medium text-zinc-500 truncate">
                      {stat._id} ({stat.count})
                    </span>
                  </div>
                ))}
                {categoryStats.length === 0 && (
                  <span className="text-[11px] text-zinc-400 col-span-2">No category data yet.</span>
                )}
              </div>
            </div>
          </div>

          {/* Skill gaps */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
            <SkillAlerts
              alerts={summary?.skillGaps}
              trending={summary?.skillGapsDefault}
              onViewAll={() => navigate('/analytics/learning')}
            />
          </div>
        </div>

        {/* Personalized learning paths */}
        <LearningRoadmaps
          paths={summary?.learningPaths}
          trending={summary?.learningPathsDefault}
          onViewAll={() => navigate('/analytics/learning')}
        />

        {/* Conversations live in the workspace */}
        <button
          onClick={() => navigate('/workspace', { state: { tab: 'chats' } })}
          className="w-full group flex items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:border-emerald-500/30 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">Your Conversations</p>
              <p className="text-[12px] text-zinc-500">Review, open, and manage all your debugging sessions in the workspace.</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider shrink-0">
            Open Workspace <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

      </div>

      <NeuralReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
};

export default DashboardPage;
