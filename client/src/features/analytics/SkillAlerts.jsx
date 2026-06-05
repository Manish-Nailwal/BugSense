import React from 'react';
import { AlertTriangle, GraduationCap, ArrowUpRight, Clock } from 'lucide-react';

/**
 * Recommended Skills — the gaps surfaced by the latest AI report (preferred) or
 * the DB-detected recurring categories, each linking to official documentation.
 * Items: { area, reason, name, url, level, count? }
 * `trending` flags the curated defaults shown before a report exists.
 * `onViewAll` (optional) renders a link to the full skills/paths archive.
 */
const SkillAlerts = ({ alerts, trending = false, onViewAll }) => {
  const items = Array.isArray(alerts) ? alerts : [];

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 px-1 mb-6">
          <AlertTriangle size={14} className="text-amber-500" />
          <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Recommended Skills</h4>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <GraduationCap size={22} />
          </div>
          <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">No skill gaps yet</p>
          <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">
            Generate a Summary Report and Trace will pinpoint the skills behind your recurring errors — with official docs to close each gap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-1 mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Recommended Skills</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
            {trending ? 'Trending now' : 'From your activity'}
          </span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              View all <ArrowUpRight size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
        {items.map((gap, idx) => (
          <a
            key={`${gap.area}-${idx}`}
            href={gap.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <GraduationCap size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h5 className="text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">{gap.area}</h5>
                  {typeof gap.count === 'number' && (
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
                      <Clock size={9} /> {gap.count}×
                    </span>
                  )}
                </div>
                {gap.reason && (
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2.5">{gap.reason}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                    {gap.name}{gap.level ? ` · ${gap.level}` : ''}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Official docs <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SkillAlerts;
