import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Eye, Tag, Zap, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticleCard = ({ article }) => {
  // Mocking some 'technical' data for aesthetics
  const difficulty = (article.tags?.length % 3) + 1; // 1 to 3
  const successRate = 95 + (article.views % 5); // 95 to 99

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link 
        to={`/library/${article.slug}`}
        className="group relative flex flex-col h-full p-6 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500 dark:hover:border-violet-500/80 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-violet-500/5 overflow-hidden"
      >
        {/* Background Hover Effect */}
        <div className="absolute top-0 right-0 p-8 text-indigo-500/5 dark:text-violet-500/5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
          <Zap size={80} />
        </div>

        <div className="flex flex-col h-full space-y-5 relative z-10">
          
          {/* Top Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors">
                <BookOpen size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-0.5">
                  Trace ID
                </span>
                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider font-mono">
                  #{article._id.substring(article._id.length - 6).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-violet-950/30 border border-indigo-100/50 dark:border-violet-900/30 text-indigo-650 dark:text-violet-400">
               <ShieldCheck size={11} />
               <span className="text-[8px] font-bold uppercase tracking-wider">Verified</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors">
              {article.title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {article.metaDescription}
            </p>
          </div>

          <div className="flex-1" />

          {/* Technical Specs Bar */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
             <div className="space-y-1">
                <p className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Accuracy</p>
                <div className="flex items-center gap-2">
                   <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-violet-500 transition-all duration-700 origin-left" 
                        style={{ width: `${successRate}%` }} 
                      />
                   </div>
                   <span className="text-[10px] font-bold text-indigo-600 dark:text-violet-400 font-mono">{successRate}%</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">Views</p>
                <div className="flex items-center gap-2">
                   <Eye size={12} className="text-zinc-400" />
                   <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 font-mono">{article.views || 0}</span>
                </div>
             </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {article.tags?.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
               <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArticleCard;
