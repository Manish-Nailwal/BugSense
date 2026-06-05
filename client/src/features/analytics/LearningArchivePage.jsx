import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAnalyticsStore from '../../store/analyticsStore';
import {
  ArrowLeft,
  Compass,
  GraduationCap,
  BookOpen,
  ArrowUpRight,
  Loader2,
  Library,
} from 'lucide-react';

/**
 * Read-only archive of every unique recommended skill + learning path the user
 * has accumulated across all their reports. Nothing is deletable — the full
 * history is retained (we use it to refine the experience later); the API caps
 * what's surfaced to the most-recent slice.
 */
const LearningArchivePage = () => {
  const navigate = useNavigate();
  const { learningArchive, isFetchingArchive, fetchLearningArchive } = useAnalyticsStore();

  useEffect(() => {
    fetchLearningArchive();
  }, [fetchLearningArchive]);

  const paths = learningArchive?.learningPaths || [];
  const skills = learningArchive?.skillGaps || [];
  const pathsDefault = learningArchive?.learningPathsDefault;
  const skillsDefault = learningArchive?.skillGapsDefault;
  const displayLimit = learningArchive?.displayLimit || 30;

  // "showing X of Y retained" — only meaningful when the user has their own history.
  const pathsRetained = learningArchive?.totalPaths || 0;
  const skillsRetained = learningArchive?.totalSkills || 0;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 scrollbar-none">
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-10">

        {/* Header */}
        <div className="space-y-5 pb-8 border-b border-zinc-100 dark:border-zinc-800/80">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to insights
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <Library size={16} />
              <span className="text-[9px] font-semibold uppercase tracking-wider">Your Growth Library</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
              Skills &amp; Learning Paths
            </h1>
            <p className="text-[13px] text-zinc-500 font-medium max-w-md leading-relaxed">
              {pathsDefault && skillsDefault
                ? 'Trending picks to get you started. Generate Summary Reports and Trace will build this into a personalized library from your real debugging activity.'
                : 'Every unique recommendation Trace has surfaced from your debugging activity, kept in one place.'}
            </p>
          </div>
        </div>

        {isFetchingArchive && !learningArchive ? (
          <div className="py-48 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider animate-pulse">Loading your library…</p>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Learning paths */}
            <section className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Compass size={15} className="text-emerald-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Learning Paths</h2>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                  {pathsDefault
                    ? 'Trending now'
                    : `Showing ${Math.min(paths.length, displayLimit)} of ${pathsRetained}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paths.map((p, i) => (
                  <a
                    key={`${p.name}-${i}`}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-zinc-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">{p.level || 'Official docs'}</p>
                    </div>
                    <ArrowUpRight size={15} className="text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </a>
                ))}
              </div>
            </section>

            {/* Recommended skills */}
            <section className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <GraduationCap size={15} className="text-amber-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Recommended Skills</h2>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                  {skillsDefault
                    ? 'Trending now'
                    : `Showing ${Math.min(skills.length, displayLimit)} of ${skillsRetained}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((g, i) => (
                  <a
                    key={`${g.area}-${i}`}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-zinc-900 dark:text-white truncate">{g.area}</p>
                      {g.reason && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">{g.reason}</p>}
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-1.5">{g.name}{g.level ? ` · ${g.level}` : ''}</p>
                    </div>
                    <ArrowUpRight size={15} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </a>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default LearningArchivePage;
