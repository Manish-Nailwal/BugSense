import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDebugStore from "../../store/debugStore";
import useAuthStore from "../../store/authStore";
import { Sparkles, Zap, ArrowUpRight } from "lucide-react";
import ErrorInput from "./ErrorInput";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { MANISH_LABS_URL } from "../../config/links";

const greetingFor = (hour) => {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const HomePage = () => {
  const navigate = useNavigate();
  const { sessionId, messages, resetSession, deepMode } = useDebugStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (sessionId || messages.length > 0) resetSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionId && messages.length > 0) navigate(`/c/${sessionId}`);
  }, [sessionId, messages, navigate]);

  const firstName = user?.displayName?.trim().split(" ")[0] || "there";
  const greeting = greetingFor(new Date().getHours());

  return (
    <div className="flex-1 h-full overflow-y-auto scrollbar-none bg-zinc-50 dark:bg-[#09090b] relative">
      {/* Ambient background: faint grid + accent glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div
          className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[130px] opacity-[0.10] dark:opacity-[0.16]"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        />
      </div>

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 sm:right-6 z-20 flex items-center gap-2">
        <a
          href={MANISH_LABS_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
        >
          Manish Labs
          <ArrowUpRight size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </a>
        <ThemeToggle />
      </div>

      <div className="min-h-full flex flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-2xl flex flex-col items-center">

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm mb-7">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ backgroundColor: "var(--accent)" }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Trace is ready
            </span>
          </div>

          {/* Greeting — muted + emphasis, monochrome to match the theme */}
          <div className="text-center space-y-2.5 mb-9">
            <h1 className="text-[1.6rem] md:text-[1.95rem] font-semibold tracking-tight leading-tight">
              <span className="text-zinc-400 dark:text-zinc-500">{greeting}, </span>
              <span className="text-zinc-900 dark:text-white">{firstName}</span>
            </h1>
            <p className="text-[13px] md:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Paste an error, stack trace, or log below — I'll break down the{" "}
              <span className="text-zinc-700 dark:text-zinc-200 font-medium">why</span> and guide you to the fix.
            </p>
          </div>

          {/* Composer */}
          <div className="w-full">
            <ErrorInput />
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={11} /> Model auto-selected
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className={`inline-flex items-center gap-1.5 ${deepMode ? "text-amber-500" : ""}`}>
                <Zap size={11} className={deepMode ? "fill-current" : ""} />
                {deepMode ? "Deep Mode on" : "Deep Mode in +"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer micro-label */}
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em] font-mono whitespace-nowrap">
        Trace // by{" "}
        <a
          href={MANISH_LABS_URL}
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
        >
          Manish Labs
        </a>
      </p>
    </div>
  );
};

export default HomePage;
