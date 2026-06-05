import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Sparkles, ChevronRight } from 'lucide-react';

const FocusGrowthBlock = () => {
  return (
    <section className="py-24 px-6 border-t border-zinc-200/50 dark:border-zinc-900 w-full text-center bg-white dark:bg-[#09090b]">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="w-12 h-12 rounded-full bg-zinc-105 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto">
          <Sparkles className="w-5 h-5 text-zinc-400" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">Elevate your runtime.</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-[13px] font-semibold leading-relaxed">
          Stop debugging via search queries. Trace organizes production error context, deduces solutions socket-by-socket, and helps you learn.
        </p>
        <div className="pt-4">
          <Link to="/auth/register">
            <Button className="px-8 py-5 text-[11px] font-black uppercase tracking-widest bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto">
              Create Free Account <ChevronRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FocusGrowthBlock;
