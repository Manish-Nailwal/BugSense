import React, { useEffect, useState } from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import CategoryChart from './CategoryChart';
import SkillAlerts from './SkillAlerts';
import SessionHistory from './SessionHistory';
import { 
  BarChart3, 
  Target, 
  Zap, 
  Search, 
  RotateCcw,
  LayoutDashboard,
  BrainCircuit,
  Settings2,
  Sparkles
} from 'lucide-react';
import NeuralReportModal from './NeuralReportModal';

const DashboardPage = () => {
  const { summary, history, pagination, isLoading, fetchSummary, fetchHistory } = useAnalyticsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isChartView, setIsChartView] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchHistory();
  }, [fetchSummary, fetchHistory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory(1, { q: searchTerm, category: activeCategory });
  };

  const handlePageChange = (page) => {
    fetchHistory(page, { q: searchTerm, category: activeCategory });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 scrollbar-none">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-emerald-500">
                <LayoutDashboard size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Performance Summary</span>
              </div>
              {summary?.isMockData && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                  Preview Mode
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Debugging <span className="text-zinc-500">Insights.</span></h1>
            <p className="text-[13px] text-zinc-500 font-medium max-w-md">
              Track your errors, fixes, and learning progress in one place.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsReportOpen(true)}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95"
            >
              <Sparkles size={16} />
              Summary Report
            </button>
            <button 
              onClick={() => { fetchSummary(true); fetchHistory(); }}
              disabled={!summary?.canManualRefresh && !summary?.isMockData}
              className={`p-3 rounded-xl border transition-all ${
                summary?.canManualRefresh || summary?.isMockData
                  ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-900/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              }`}
              title={(!summary?.canManualRefresh && !summary?.isMockData) ? "Manual updates limited to once per week." : "Refresh Analytics"}
            >
              <RotateCcw size={18} />
            </button>
            <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2 hidden md:block" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Last Updated</span>
              <span className="text-[12px] font-mono text-zinc-900 dark:text-zinc-300">
                {summary?.lastManualUpdate && new Date(summary.lastManualUpdate).getTime() > 0 
                  ? new Date(summary.lastManualUpdate).toLocaleDateString()
                  : 'Auto-synced'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Queries', 
              value: summary?.totalQueries || 0, 
              icon: BarChart3, 
              color: 'text-blue-500', 
              sub: `${summary?.totalQueries || 0} / ${summary?.queryLimit || 100} Quota` 
            },
            { label: 'Solved Issues', value: summary?.confirmedFixes || 0, icon: Target, color: 'text-emerald-500' },
            { label: 'Common Issue', value: summary?.topCategory || 'N/A', icon: BrainCircuit, color: 'text-purple-500' },
            { label: 'Success Rate', value: summary?.efficiency || '0%', icon: Zap, color: 'text-amber-500' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white italic">
                  {stat.value}
                </div>
                {stat.sub && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter">
                      <span className="text-zinc-400">Monthly Usage</span>
                      <span className="text-zinc-500">{Math.round(((summary?.totalQueries || 0) / (summary?.queryLimit || 100)) * 100)}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000" 
                        style={{ width: `${Math.min(100, ((summary?.totalQueries || 0) / (summary?.queryLimit || 100)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {isChartView ? 'Error Types' : 'Detailed List'}
              </h3>
              <button 
                onClick={() => setIsChartView(!isChartView)}
                className={`p-2 rounded-lg transition-all ${!isChartView ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <Settings2 size={16} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {isChartView ? (
                <div className="flex flex-col h-full space-y-6">
                  <div className="h-[280px]">
                    <CategoryChart data={summary?.categoryStats} />
                  </div>
                  {/* Mini-Legend Summary to fill space */}
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {summary?.categoryStats?.slice(0, 4).map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'][idx % 7] }} />
                        <span className="text-[9px] font-black text-zinc-500 uppercase truncate">
                          {stat._id} ({stat.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  {summary?.categoryStats?.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50 group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'][idx % 7] }} />
                        <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px] uppercase tracking-tight">{stat._id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-600">{stat.count} FIXES</span>
                        <div className="w-10 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${summary.totalSessions > 0 ? (stat.count / summary.totalSessions) * 100 : 0}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!summary?.categoryStats || summary.categoryStats.length === 0) && (
                    <p className="text-center text-zinc-500 text-[11px] italic">Crunching your data...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alerts Section */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
            <SkillAlerts alerts={summary?.skillGapAlerts} />
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Activity Log</h3>
              <div className="h-0.5 w-6 bg-emerald-500/50 rounded-full mt-1" />
            </div>
            
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 md:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                <input 
                  type="text" 
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-[13px] text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-[11px] font-bold rounded-xl transition-all"
              >
                Apply
              </button>
            </form>
          </div>

          <SessionHistory 
            sessions={history} 
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>

      </div>
      
      <NeuralReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
};

export default DashboardPage;
