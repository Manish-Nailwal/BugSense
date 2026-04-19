import React from 'react';
import { AlertTriangle, ExternalLink, GraduationCap, ArrowRight, Clock, Target, Zap, Brain } from 'lucide-react';
import LearningRoadmaps from './LearningRoadmaps';

const SkillAlerts = ({ alerts }) => {
  const techDocs = {
    typescript: { url: "https://www.typescriptlang.org/docs/", icon: Zap, color: "text-blue-600", bg: "bg-blue-600/10", badge: "text-blue-600 bg-blue-600/5 border-blue-600/10" },
    java: { url: "https://docs.oracle.com/en/java/javase/17/docs/api/", icon: Brain, color: "text-orange-600", bg: "bg-orange-600/10", badge: "text-orange-600 bg-orange-600/5 border-orange-600/10" },
    react: { url: "https://react.dev/reference/react", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", badge: "text-blue-500 bg-blue-500/5 border-blue-500/10" },
    node: { url: "https://nodejs.org/api/", icon: Brain, color: "text-emerald-500", bg: "bg-emerald-500/10", badge: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
    mongodb: { url: "https://www.mongodb.com/docs/", icon: Target, color: "text-green-600", bg: "bg-green-600/10", badge: "text-green-600 bg-green-600/5 border-green-600/10" },
    javascript: { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", badge: "text-yellow-500 bg-yellow-500/5 border-yellow-500/10" },
    nextjs: { url: "https://nextjs.org/docs", icon: Brain, color: "text-zinc-900 dark:text-white", bg: "bg-zinc-100 dark:bg-white/10", badge: "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10" },
    tailwind: { url: "https://tailwindcss.com/docs", icon: Target, color: "text-cyan-500", bg: "bg-cyan-500/10", badge: "text-cyan-500 bg-cyan-500/5 border-cyan-500/10" },
  };

  const getTechMeta = (category) => {
    const key = Object.keys(techDocs).find(k => category.toLowerCase().includes(k));
    return techDocs[key] || { 
      url: "#", 
      icon: GraduationCap, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10", 
      badge: "text-amber-500 bg-amber-500/5 border-amber-500/10" 
    };
  };

  if (!alerts || alerts.length === 0) {
    return <LearningRoadmaps />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Recommended Skills</h4>
        </div>
      </div>

      <div className="max-h-[460px] overflow-y-auto pr-2 space-y-4 scrollbar-none scroll-smooth">
        {alerts.map((alert, idx) => {
          const meta = getTechMeta(alert.category);
          const Icon = meta.icon;

          return (
            <a
              key={idx}
              href={meta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/30 transition-all duration-300 cursor-pointer overflow-hidden block"
            >
              <div className="flex items-start gap-5">
                <div className={`w-11 h-11 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={meta.color} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-[15px] font-extrabold text-zinc-900 dark:text-zinc-100 truncate pr-4">
                      Boost Skill: {alert.category}
                    </h5>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-2 py-0.5 rounded">
                        <Clock size={10} />
                        {alert.count} Issues
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    The system detected recurring mistakes in your code. Strengthening your knowledge here will help you solve errors much faster.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${meta.badge}`}>
                      Top Pick
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Documentation <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SkillAlerts;
