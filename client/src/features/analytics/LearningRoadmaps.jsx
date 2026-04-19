import React from 'react';
import { Compass, Clock, ArrowRight, Zap, Target, Brain } from 'lucide-react';

const ROADMAPS = [
  {
    id: 'react',
    title: 'React.js Core',
    description: 'Master components, hooks, and modern state management.',
    duration: 'Framework',
    level: 'Advanced',
    icon: Zap,
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    badgeClass: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    url: 'https://react.dev'
  },
  {
    id: 'tailwindcss',
    title: 'Tailwind CSS',
    description: 'Rapidly build modern websites without leaving your HTML.',
    duration: 'Styling',
    level: 'Intermediate',
    icon: Target,
    colorClass: 'text-cyan-500',
    bgClass: 'bg-cyan-500/10',
    badgeClass: 'text-cyan-500 bg-cyan-500/5 border-cyan-500/10',
    url: 'https://tailwindcss.com/docs'
  },
  {
    id: 'nextjs',
    title: 'Next.js App Router',
    description: 'The standard for production React applications.',
    duration: 'Fullstack',
    level: 'Expert',
    icon: Brain,
    colorClass: 'text-zinc-900 dark:text-white',
    bgClass: 'bg-zinc-100 dark:bg-white/10',
    badgeClass: 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10',
    url: 'https://nextjs.org/docs'
  },
  {
    id: 'typescript',
    title: 'TypeScript Strategy',
    description: 'Type-safe development for enterprise applications.',
    duration: 'Language',
    level: 'Intermediate',
    icon: Zap,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-600/10',
    badgeClass: 'text-blue-600 bg-blue-600/5 border-blue-600/10',
    url: 'https://www.typescriptlang.org/docs/'
  },
  {
    id: 'nodejs',
    title: 'Node.js Runtime',
    description: 'Build scalable network applications on V8.',
    duration: 'Backend',
    level: 'Advanced',
    icon: Brain,
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    badgeClass: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    url: 'https://nodejs.org/docs'
  },
  {
    id: 'postgresql',
    title: 'PostgreSQL Architecture',
    description: 'Master advanced relational data modeling and querying.',
    duration: 'Database',
    level: 'Expert',
    icon: Target,
    colorClass: 'text-indigo-500',
    bgClass: 'bg-indigo-500/10',
    badgeClass: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10',
    url: 'https://www.postgresql.org/docs/'
  },
  {
    id: 'docker',
    title: 'Docker Containers',
    description: 'Containerization and environment consistency.',
    duration: 'DevOps',
    level: 'Intermediate',
    icon: Zap,
    colorClass: 'text-sky-500',
    bgClass: 'bg-sky-500/10',
    badgeClass: 'text-sky-500 bg-sky-500/5 border-sky-500/10',
    url: 'https://docs.docker.com/'
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes Mastery',
    description: 'Orchestrating production container workloads at scale.',
    duration: 'Infrastructure',
    level: 'Expert',
    icon: Brain,
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-700/10',
    badgeClass: 'text-blue-700 bg-blue-700/5 border-blue-700/10',
    url: 'https://kubernetes.io/docs/'
  },
  {
    id: 'graphql',
    title: 'GraphQL API Design',
    description: 'Efficient data fetching with strongly typed APIs.',
    duration: 'API Layer',
    level: 'Advanced',
    icon: Target,
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10',
    badgeClass: 'text-pink-500 bg-pink-500/5 border-pink-500/10',
    url: 'https://graphql.org/learn/'
  },
  {
    id: 'redis',
    title: 'Redis Cache Patterns',
    description: 'In-memory data structures for high performance.',
    duration: 'Performance',
    level: 'Intermediate',
    icon: Zap,
    colorClass: 'text-rose-500',
    bgClass: 'bg-rose-500/10',
    badgeClass: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
    url: 'https://redis.io/docs/'
  },
  {
    id: 'express',
    title: 'Express.js Framework',
    description: 'The standard web framework for Node.js backend services.',
    duration: 'Backend',
    level: 'Core',
    icon: Target,
    colorClass: 'text-zinc-500',
    bgClass: 'bg-zinc-500/10',
    badgeClass: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/10',
    url: 'https://expressjs.com/'
  }
];

const LearningRoadmaps = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-emerald-500" />
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Official Learning Paths</h4>
        </div>
      </div>

      <div className="max-h-[460px] overflow-y-auto pr-2 space-y-4 scrollbar-none scroll-smooth">
        {ROADMAPS.map((roadmap) => (
          <a
            key={roadmap.id}
            href={roadmap.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden block"
          >
            <div className="flex items-start gap-5">
              <div className={`w-11 h-11 rounded-xl ${roadmap.bgClass} flex items-center justify-center shrink-0`}>
                <roadmap.icon size={22} className={roadmap.colorClass} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-[15px] font-extrabold text-zinc-900 dark:text-zinc-100 truncate pr-4">
                    {roadmap.title}
                  </h5>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      <Clock size={10} />
                      {roadmap.duration}
                    </div>
                  </div>
                </div>
                
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                  {roadmap.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${roadmap.badgeClass}`}>
                    {roadmap.level}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Docs <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LearningRoadmaps;
