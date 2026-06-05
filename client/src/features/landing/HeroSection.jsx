import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowUpRight } from 'lucide-react';
import { MANISH_LABS_URL } from '../../config/links';

const HeroSection = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      if (target && target.scrollTop !== undefined) {
        setScrolled(target.scrollTop > 50);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen pt-28 pb-32 overflow-hidden bg-white dark:bg-[#09090b]">
      {/* Background radial glow inspired by ManishLabs */}
      <div className="absolute top-[35%] left-1/2 -translate-x-[50%] -translate-y-[50%] w-[45rem] h-[45rem] bg-gradient-to-r from-zinc-100/50 to-indigo-50/20 dark:from-zinc-900/40 dark:to-violet-950/15 z-0 pointer-events-none filter blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-7xl mx-auto px-6 w-full my-auto">
        <div className="max-w-4xl flex flex-col items-center">
          {/* Badge indicator — links to the parent ecosystem hub */}
          <a
            href={MANISH_LABS_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/80 text-xs font-semibold tracking-wider uppercase text-zinc-550 dark:text-zinc-400 mb-8 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)] animate-pulse" />
            Trace by Manish Labs
            <ArrowUpRight size={12} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-zinc-950 dark:text-white">
            Deduce your errors.<br />
            Understand your runtime.<br />
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-violet-400 bg-clip-text text-transparent">
              Trace your execution.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-10">
            An active diagnostic digital laboratory that transforms messy logs, db memory bottlenecks, 
            and unhandled promise rejections into interactive learning tracks.
          </p>

          {/* Action links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="px-6 py-3 text-sm font-semibold rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-lg shadow-zinc-500/5 dark:shadow-none hover:-translate-y-[1px] transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/library"
              className="px-6 py-3 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-200"
            >
              Explore Fixes
            </Link>
            <Link
              to="/guide"
              className="px-6 py-3 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all duration-200 flex items-center gap-2 group"
            >
              <span>Ecosystem Guide</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mouse scroll wheel animator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ease-in-out ${
          scrolled ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-6 h-10 border-2 border-zinc-300 dark:border-zinc-700/80 rounded-xl flex justify-center pt-2 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors duration-300">
          <div className="w-1.5 h-2.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
