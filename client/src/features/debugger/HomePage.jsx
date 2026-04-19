import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDebugStore from "../../store/debugStore";
import { Zap, Activity, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
import ErrorInput from "./ErrorInput";

const HomePage = () => {
  const navigate = useNavigate();
  const { sessionId, messages, resetSession } = useDebugStore();

  useEffect(() => {
    if (sessionId || messages.length > 0) {
      resetSession();
    }
  }, []);

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      navigate(`/c/${sessionId}`);
    }
  }, [sessionId, messages, navigate]);

  const sampleQueries = [
    "React hook dependency error",
    "Java NullPointerException",
    "Node.js MODULE_NOT_FOUND",
    "Python list index out of range"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-950 h-full overflow-hidden relative">
      {/* Neural Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-emerald-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer">
              <Zap size={28} className="text-emerald-500 fill-emerald-500/10" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-[1000] text-zinc-900 dark:text-white tracking-tight italic">
              Solve faster.{" "}
              <span className="text-zinc-400 dark:text-zinc-600">
                Fix smarter.
              </span>
            </h1>
            <p className="text-[14px] font-medium text-zinc-500 max-w-md mx-auto">
              Smart Debug AI trained on system logs and stack traces. Paste your error below to get started.
            </p>
          </div>
        </div>

        {/* Centerpiece: Input with Quickstarts */}
        <div className="w-full space-y-6">
          <ErrorInput />
          
          <div className="flex flex-wrap items-center justify-center gap-2">
             <span className="w-full text-center text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Try pasting a sample:</span>
             {sampleQueries.map((query, idx) => (
               <button 
                 key={idx}
                 className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/40 transition-all active:scale-95"
               >
                 {query}
               </button>
             ))}
          </div>
        </div>

        {/* Simplified Status Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-10 pt-8 border-t border-zinc-100 dark:border-zinc-800/50 w-full max-w-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Help</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Private</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Smart Suggestions</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center">
        <p className="text-[9px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.3em] font-mono">
          BUGSENSE SYSTEM v3.4.1
        </p>
      </div>
    </div>
  );
};

export default HomePage;
