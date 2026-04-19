import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight, 
  Zap, 
  Settings as SettingsIcon,
  Library,
  MessageSquare,
  Eye,
  Clock
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import useAnalyticsStore from '../../store/analyticsStore';
import useLibraryStore from '../../store/libraryStore';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { summary } = useAnalyticsStore();
  const { myArticles, fetchMyArticles, isLoading: isLibraryLoading } = useLibraryStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchMyArticles(user._id);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 scrollbar-none">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="mb-12 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <SettingsIcon size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Account Settings</span>
          </div>
          <h1 className="text-4xl font-[1000] tracking-tighter italic">User <span className="text-zinc-400 dark:text-zinc-600">Settings.</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Panel: Profile Info (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform duration-500">
                    {user?.displayName?.[0] || 'U'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-500 shadow-xl">
                    <ShieldCheck size={16} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-[1000] tracking-tight italic">{user?.displayName || 'User'}</h2>
                  <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{user?.email}</p>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Bugs Fixed</p>
                    <p className="text-xl font-black text-emerald-500 italic">{summary?.confirmedFixes || 0}</p>
                  </div>
                  <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Articles</p>
                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic">{myArticles?.length || 0}</p>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:shadow-2xl hover:shadow-rose-600/20 active:scale-95"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Panel: Content (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. Published Articles */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                    <Library size={16} />
                  </div>
                  <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-zinc-400">Published Articles</h3>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 italic">Total: {myArticles?.length || 0}</span>
              </div>

              <div className="max-h-[520px] overflow-y-auto pr-2 space-y-4 scrollbar-none scroll-smooth">
                {isLibraryLoading ? (
                  <div className="h-40 rounded-[40px] bg-zinc-100 dark:bg-zinc-900/50 animate-pulse flex items-center justify-center">
                    <span className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.2em]">Loading Articles...</span>
                  </div>
                ) : myArticles?.length > 0 ? (
                  myArticles.map((article) => (
                    <motion.div 
                      key={article._id}
                      whileHover={{ x: 4 }}
                      className="group p-6 rounded-[32px] bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {article.tags?.slice(0, 1).map((tag, i) => (
                            <span key={i} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{tag}</span>
                          ))}
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{new Date(article.publishedAt).getFullYear()}</span>
                        </div>
                        <h4 className="text-lg font-black tracking-tight group-hover:text-emerald-500 transition-colors italic leading-tight">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                          <span className="flex items-center gap-1.5"><Eye size={12} className="text-zinc-500" /> {article.views} Views</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-zinc-500" /> {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => navigate(`/library/${article.slug}`)}
                          className="px-5 py-2.5 rounded-2xl bg-zinc-900 dark:bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => navigate(`/c/${article.sessionId}`)}
                          className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-all"
                          title="View Original Chat"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-[12px] font-bold text-zinc-400 italic">You haven't published any articles yet.</p>
                    <button 
                      onClick={() => navigate('/')}
                      className="mt-4 text-[11px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
                    >
                      New Debugging Session
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Preferences */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                  <SettingsIcon size={16} />
                </div>
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-zinc-400">Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={toggleTheme}
                  className="p-8 rounded-[40px] bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div className="w-12 h-7 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 relative">
                      <motion.div 
                        initial={false}
                        animate={{ x: theme === 'dark' ? 20 : 0 }}
                        className="w-5 h-5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" 
                      />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Appearance</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>

                <div className="p-8 rounded-[40px] bg-zinc-900 border border-zinc-800 relative overflow-hidden flex flex-col justify-end min-h-[160px]">
                   <div className="absolute top-0 right-0 p-6 opacity-20">
                     <Zap size={100} className="text-emerald-500" />
                   </div>
                   <div className="relative z-10 space-y-4">
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Monthly Usage</p>
                       <p className="text-2xl font-[1000] tracking-tighter text-white italic">
                         {summary?.totalQueries || 0} / {summary?.queryLimit || 1000} Queries
                       </p>
                     </div>
                     <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((summary?.totalQueries || 0) / (summary?.queryLimit || 1000)) * 100, 100)}%` }}
                          className="h-full bg-emerald-500"
                        />
                     </div>
                   </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.4em]">BugSense Collective v2.5.0</span>
          </div>
          <p className="text-[11px] font-bold text-zinc-400 italic">"Simplifying the way we solve software errors."</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
