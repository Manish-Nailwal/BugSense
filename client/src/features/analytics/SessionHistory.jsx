import React from 'react';
import { Terminal, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

const SessionHistory = ({ sessions, pagination, onPageChange, onFilterChange }) => {
  const navigate = useNavigate();
  
  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 space-y-4">
        <Search size={40} className="text-zinc-200 dark:text-zinc-800" />
        <p className="text-sm font-medium italic">No sessions found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-4">
              <th className="pb-4 pl-4">Session Info</th>
              <th className="pb-4">Category</th>
              <th className="pb-4 text-center">Date</th>
              <th className="pb-4 text-center">Status</th>
              <th className="pb-4 pr-4"></th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {sessions.map((session) => (
              <tr 
                key={session._id}
                onClick={() => navigate(`/c/${session._id}`)}
                className="group bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/50 transition-all duration-200 cursor-pointer"
              >
                <td className="py-4 pl-4 rounded-l-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                      <Terminal size={14} className="text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <div className="flex flex-col max-w-[200px] md:max-w-md">
                      <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-200 truncate">
                        {session.rawError.split('\n')[0].substring(0, 50)}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                        ID: {session._id.substring(session._id.length - 8)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    {session.category || 'Debug'}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-[11px] font-bold text-zinc-400">
                    {formatDate(session.createdAt)}
                  </span>
                </td>
                <td className="py-4 text-center">
                  {session.confirmedFix?.isConfirmed ? (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-500">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Fixed</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Pending</span>
                  )}
                </td>
                <td className="py-4 pr-4 rounded-r-2xl text-right">
                  <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-colors inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
                pagination.currentPage === page 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
