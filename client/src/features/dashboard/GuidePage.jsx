import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  Lightbulb,
  Cpu,
  Sparkles,
  X,
  Zap,
  ArrowRight,
  ChevronRight,
  Code,
  Terminal,
  Play,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import guideData from "./guideData.json";
import useAuthStore from "../../store/authStore";
import useDebugStore from "../../store/debugStore";

const GuidePage = () => {
  const { user } = useAuthStore();
  const { setErrorInput } = useDebugStore();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [roadmapFocus, setRoadmapFocus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState("");
  const stepsContainerRef = useRef(null);

  // Suggested prompts for developers
  const suggestions = [
    "React Hydration Mismatch",
    "Docker DB Connection Timeout",
    "Next.js Middleware Infinite Loop",
    "MongoDB Authentication Failed",
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute("data-step"), 10);
            if (!isNaN(step)) {
              setActiveStep(step);
            }
          }
        });
      },
      { 
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0.1 
      }
    );

    const stepElements = document.querySelectorAll("[data-step]");
    stepElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleStartDebugging = (query = roadmapFocus) => {
    if (!query) return;
    if (!user) {
      navigate("/auth/login");
      return;
    }
    setErrorInput(query);
    navigate("/");
  };

  const handleGeneratePreview = async () => {
    if (!roadmapFocus) return;
    setIsGenerating(true);
    setGeneratedRoadmap("");
    
    // Simulate AI thinking and streaming out a blueprint roadmap
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockPlan = `[TRACE SYSTEM ROADMAP GENERATOR]
TOPIC: ${roadmapFocus}
STATUS: DEDUCTIVE BLUEPRINT READY

STAGE 1: ISOLATE RUNTIME CONTEXT
- Hook system traceback logs using Trace parser.
- Identify the call site frame containing target scope.

STAGE 2: AI DEDUCTIVE ENGINE
- Execute context expansion on target stack traces.
- Run private token sanitizer to scrub authorization keys.

STAGE 3: RESOLUTION PATHWAYS
- Apply recommended code patching for hydration/timeouts.
- Run local verify using dev tooling.
- Confirm resolution and store telemetry inside Library.`;
    
    setGeneratedRoadmap(mockPlan);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 relative selection:bg-indigo-500/20 dark:selection:bg-violet-500/30 selection:text-indigo-650 dark:selection:text-violet-300">
      
      {/* Premium Technical Grid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-violet-500/10 dark:to-transparent blur-[130px] rounded-full" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent dark:from-fuchsia-500/5 dark:to-transparent blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto border-b border-zinc-200/60 dark:border-zinc-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Text */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-violet-950/30 border border-indigo-100/50 dark:border-violet-900/30 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 dark:bg-violet-400 animate-pulse" />
              Developer Documentation
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.05]">
              Master the <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">Resolution</span> Flow.
            </h1>
            
            <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              Trace turns messy stack traces into clear, actionable architectural plans. Follow this interactive guide to optimize your debugging cycle.
            </p>

            {/* Quick Specs telemetry */}
            <div className="grid grid-cols-3 gap-6 pt-4 max-w-lg border-t border-zinc-200/55 dark:border-zinc-900/60">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-1">Deductive Engine</div>
                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">Gemini Pro</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-1">Scrubbing Scope</div>
                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">Client-Side Only</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mb-1">Telemetry Library</div>
                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-200">Instant Sync</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-violet-500/10 blur-[80px] rounded-3xl" />
            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-900">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-250 dark:bg-zinc-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-250 dark:bg-zinc-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-250 dark:bg-zinc-800" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">trace_engine_status.sh</span>
              </div>
              <div className="space-y-2 font-mono text-xs text-zinc-650 dark:text-zinc-400">
                <p className="text-indigo-600 dark:text-violet-400 font-bold">$ trace --init</p>
                <p className="text-zinc-400 dark:text-zinc-500">// Binding server environment on localhost:5173</p>
                <p className="text-zinc-700 dark:text-zinc-300">✓ Ingestion listener initialized</p>
                <p className="text-emerald-600 dark:text-emerald-400">✓ Ready to intercept system exceptions</p>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  v1.2.0-stable
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Interactive Walkthrough Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Vertical Timeline Steps */}
          <div className="lg:col-span-7 space-y-16" ref={stepsContainerRef}>
            {guideData.map((step, idx) => {
              const isCurrent = activeStep === idx;
              return (
                <div
                  key={idx}
                  data-step={idx}
                  className={`relative pl-8 md:pl-12 border-l-2 transition-all duration-300 ${
                    isCurrent 
                      ? "border-indigo-600 dark:border-violet-500 opacity-100" 
                      : "border-zinc-200 dark:border-zinc-900 opacity-50 hover:opacity-80"
                  }`}
                >
                  {/* Glowing Step Bubble */}
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300 ${
                    isCurrent 
                      ? "bg-indigo-650 dark:bg-violet-600 text-white border-indigo-600 dark:border-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.4)] scale-110" 
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                  }`}>
                    {step.step}
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-violet-450">
                      Phase {step.step} &bull; {step.subtitle}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-zinc-850 dark:text-white tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
                      {step.description}
                    </p>

                    {/* Pro-Tip Box */}
                    <div className="p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-850/50 flex gap-3.5 backdrop-blur-sm">
                      <div className="w-6 h-6 shrink-0 rounded bg-indigo-50 dark:bg-violet-950/50 flex items-center justify-center text-indigo-650 dark:text-violet-400">
                        <Lightbulb size={14} />
                      </div>
                      <p className="text-xs font-medium text-zinc-650 dark:text-zinc-400 italic">
                        {step.tips}
                      </p>
                    </div>

                    {/* Clickable Mobile/Tablet preview view indicator */}
                    <button 
                      onClick={() => setActiveStep(idx)}
                      className="lg:hidden inline-flex items-center gap-1.5 text-xs font-bold text-indigo-650 dark:text-violet-400 hover:underline pt-2"
                    >
                      View details layout <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Visual Preview Screen */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/50 shadow-2xl overflow-hidden backdrop-blur-md">
                
                {/* Console header */}
                <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal size={10} /> Preview Screen
                  </span>
                </div>

                {/* Main Image View */}
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeStep}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      src={guideData[activeStep]?.image}
                      alt={guideData[activeStep]?.title}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Marker overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-violet-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-zinc-300 font-mono">
                        {guideData[activeStep]?.marker}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-black">
                      STEP {guideData[activeStep]?.step}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auxiliary telemetry status panel */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <span>Interactive Telemetry</span>
                  <span className="text-indigo-600 dark:text-violet-400">ACTIVE</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Scroll the page or click step markers on the left to review the lifecycle stages of error isolation within the Trace platform.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* AI Command Center: Custom Roadmap Section */}
      <section className="border-t border-zinc-200 dark:border-zinc-900 py-24 px-6 bg-zinc-100/50 dark:bg-zinc-950/30">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-violet-950/40 text-indigo-650 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest">
              <Cpu size={12} /> Blueprint Sandbox
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-850 dark:text-white">
              Generate custom fix steps.
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
              Describe your error theme to build a step-by-step resolution blueprint.
            </p>
          </div>

          <div className="space-y-6">
            {/* Input card container */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={roadmapFocus}
                    onChange={(e) => setRoadmapFocus(e.target.value)}
                    placeholder="e.g., React Hydration Mismatch, database lock issue..."
                    className="w-full bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleGeneratePreview}
                    disabled={!roadmapFocus || isGenerating}
                    className="flex-1 md:flex-initial px-5 py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-40 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isGenerating ? "Thinking..." : "Generate Preview"}
                  </button>
                  <button
                    onClick={() => handleStartDebugging()}
                    disabled={!roadmapFocus}
                    className="flex-1 md:flex-initial px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white disabled:opacity-40 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 dark:shadow-violet-500/15"
                  >
                    <span>Start Debug</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Suggestions list */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mr-1">Suggestions:</span>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setRoadmapFocus(item);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-850 text-[10px] font-bold text-zinc-650 dark:text-zinc-400 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated roadmap response panel */}
            <AnimatePresence>
              {(isGenerating || generatedRoadmap) && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl"
                >
                  <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-indigo-650 dark:text-violet-400" />
                      <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {isGenerating ? "Synthesizing plan..." : "Blueprint Output"}
                      </span>
                    </div>
                    {!isGenerating && (
                      <button
                        onClick={() => setGeneratedRoadmap("")}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="p-6 bg-zinc-950 text-zinc-300 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre selection:bg-indigo-500/25 selection:text-white">
                    {isGenerating ? (
                      <div className="flex items-center gap-2 text-zinc-500 py-4">
                        <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-violet-400 rounded-full animate-ping" />
                        <span>Analysing runtime boundaries...</span>
                      </div>
                    ) : (
                      generatedRoadmap
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

    </div>
  );
};

export default GuidePage;
