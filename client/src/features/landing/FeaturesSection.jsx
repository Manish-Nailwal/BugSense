import React from 'react';
import { Shield, Brain, BarChart3, Cpu, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 border-t border-zinc-150 dark:border-zinc-900/60 w-full bg-zinc-50/30 dark:bg-[#09090b] relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-violet-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-violet-950/30 text-[10px] font-bold uppercase tracking-wider text-indigo-650 dark:text-violet-400 mb-4 border border-indigo-100/50 dark:border-violet-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-violet-400 animate-pulse" />
            Core Capabilities
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Engineered for high-fidelity code diagnostics.
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
            Trace automates logs digestion, cleans private secrets before compile, and provides real-time mental models to solve complex runtime exceptions.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Log Filtration (Span 2 columns on desktop) */}
          <div className="md:col-span-2 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[360px] group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/30 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-violet-450" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Automated Privacy Sanitization</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-[13px] leading-relaxed max-w-lg">
                Trace automatically detects sensitive tokens, environment variables, authorization headers, and database connection strings, and redacts them client-side before submission.
              </p>
            </div>

            {/* Micro Mockup */}
            <div className="mt-6 font-mono text-[11px] bg-zinc-950 dark:bg-zinc-950/80 text-zinc-300 rounded-xl border border-zinc-800/80 p-4 shadow-lg overflow-x-auto whitespace-nowrap">
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-zinc-800/60 mb-2.5 text-[9px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="font-semibold">local_ingest_payload.json</span>
              </div>
              <div className="space-y-1">
                <div><span className="text-zinc-500">"database":</span> <span className="text-emerald-400">"mongodb+srv://..."</span> <span className="text-indigo-400 dark:text-violet-400 font-bold">→ [REDACTED]</span></div>
                <div><span className="text-zinc-500">"authToken":</span> <span className="text-emerald-400">"Bearer ghp_82X..."</span> <span className="text-indigo-400 dark:text-violet-400 font-bold">→ [REDACTED]</span></div>
              </div>
            </div>
          </div>

          {/* Card 2: Mental Model Engine */}
          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[360px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/30 flex items-center justify-center mb-6">
                <Brain className="w-5 h-5 text-indigo-600 dark:text-violet-450" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Mental Model Engine</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-[13px] leading-relaxed">
                Rather than writing basic code blocks for you to paste, Trace helps you understand the root engineering constraints and logic patterns behind the crash.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-violet-400 mb-2">
                <span>DEDUCTIVE SYSTEM</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-violet-950/50 text-indigo-600 dark:text-violet-300 text-[9px] font-bold">ACTIVE</span>
              </div>
              <p className="text-zinc-400 dark:text-zinc-500 text-[10px] italic">
                "Why did connection pool exhaust? What was holding the DB lock?"
              </p>
            </div>
          </div>

          {/* Card 3: Metrics & Analytics */}
          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[360px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/30 flex items-center justify-center mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-violet-450" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Resolution Metrics</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-[13px] leading-relaxed">
                Analyze diagnostic categories, tracking errors by frequency and type. Know where the runtime is most unstable.
              </p>
            </div>

            <div className="mt-6 space-y-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500 font-medium">Resolution Rate</span>
                <span className="font-extrabold text-zinc-900 dark:text-white">98.4%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                <div className="w-[98.4%] h-full bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-violet-500 dark:to-fuchsia-500" />
              </div>
            </div>
          </div>

          {/* Card 4: Languages & Ecosystem (Span 2 columns on desktop) */}
          <div className="md:col-span-2 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[360px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/30 flex items-center justify-center mb-6">
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-violet-450" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Universal Parser Ecosystem</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-[13px] leading-relaxed">
                Out-of-the-box support for stack traces from Node.js, Next.js, Django, Rust runtimes, React execution engines, and SQL/MongoDB database query layers.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Node.js', 'Next.js', 'Django', 'Rust', 'React', 'MongoDB', 'PostgreSQL'].map((tech) => (
                <span 
                  key={tech} 
                  className="px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-[11px] font-bold text-zinc-650 dark:text-zinc-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
