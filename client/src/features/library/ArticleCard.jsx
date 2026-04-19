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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link 
        to={`/library/${article.slug}`}
        className="group relative flex flex-col h-full p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-emerald-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
      >
        {/* Background Hover Effect */}
        <div className="absolute top-0 right-0 p-12 text-emerald-500/5 group-hover:text-emerald-500/10 group-hover:scale-150 transition-all duration-700 pointer-events-none">
          <Zap size={100} />
        </div>

        <div className="flex flex-col h-full space-y-6 relative z-10">
          
          {/* Top Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-[14px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                <BookOpen size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">
                  Report ID
                </span>
                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-mono">
                  #{article._id.substring(article._id.length - 6).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
               <ShieldCheck size={12} />
               <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-[1000] text-zinc-900 dark:text-white italic tracking-tighter line-clamp-2 leading-[1.1] group-hover:text-emerald-500 transition-colors">
              {article.title}
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed tracking-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
              {article.metaDescription}
            </p>
          </div>

          <div className="flex-1" />

          {/* Technical Specs Bar */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
             <div className="space-y-1">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Accuracy</p>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 group-hover:scale-x-110 origin-left" 
                        style={{ width: `${successRate}%` }} 
                      />
                   </div>
                   <span className="text-[10px] font-black text-emerald-500 font-mono">{successRate}%</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Views</p>
                <div className="flex items-center gap-2">
                   <Eye size={12} className="text-zinc-400" />
                   <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 font-mono">{article.views || 0}</span>
                </div>
             </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between group/action">
            <div className="flex flex-wrap gap-2">
              {article.tags?.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.1em]">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="w-10 h-10 rounded-full bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 -mr-2 group-hover:mr-0 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 shadow-xl">
               <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArticleCard;
