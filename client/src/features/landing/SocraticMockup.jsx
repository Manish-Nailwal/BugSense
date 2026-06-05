import React from 'react';
import { motion } from 'framer-motion';

const SocraticMockup = () => {
  return (
    <section className="pb-24 px-6 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Log Input (Terminal) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0c0c0e]/60 backdrop-blur-md overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.02)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.3)] text-left flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-100/30 dark:bg-zinc-900/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">console_output.log</span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-[12px] leading-relaxed flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">STDERR</span>
                <span>localhost:3000 • Connection Failure</span>
              </div>
              <pre className="text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
                {`Error: Connection pool exhausted. Active connections: 100. Max: 100.
  at Pool.acquire (/srv/db/connection-pool.js:42:11)
  at async findUserSession (/srv/controllers/user.controller.js:14:23)
  at async handleRequest (/srv/server.js:98:5)`}
              </pre>
            </div>
            <div className="text-zinc-400 dark:text-zinc-600 mt-12 select-none animate-pulse font-mono flex items-center gap-1">
              <span>▋</span> <span className="text-[10px] uppercase font-bold tracking-widest">Ingesting raw diagnostic stack...</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Socratic Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0c0c0e]/60 backdrop-blur-md overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.02)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.3)] text-left flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-100/30 dark:bg-zinc-900/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Trace Engine Breakdown</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-violet-500">Active</span>
            </div>
          </div>

          {/* Breakdown Content */}
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="text-zinc-800 dark:text-zinc-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-violet-400"># 🔍 The Breakdown</span>
                <p className="mt-1.5 text-zinc-650 dark:text-zinc-400 font-sans text-[13px] leading-relaxed">
                  The database connection pool reached its strict limit of 100, causing subsequent user connection requests to hang and crash instantly.
                </p>
              </div>
              <div className="text-zinc-800 dark:text-zinc-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-violet-400"># 🧠 The Mental Model</span>
                <p className="mt-1.5 text-zinc-650 dark:text-zinc-400 font-sans text-[13px] leading-relaxed">
                  A connection pool is a queue. If database socket references are opened but never released (leaked), the queue lock causes query timeout.
                </p>
              </div>
              <div className="text-zinc-800 dark:text-zinc-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-violet-400"># 🧬 Probable Causality</span>
                <p className="mt-1.5 text-zinc-650 dark:text-zinc-400 font-sans text-[13px] leading-relaxed">
                  1. A missing connection close command in error exception blocks.<br />
                  2. Sockets locked by hanging async processes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SocraticMockup;
