import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Lightbulb,
  Cpu,
  Sparkles,
  RefreshCw,
  X,
  Loader2,
  Zap,
} from "lucide-react";
import axios from "axios";
import guideData from "./guideData.json";

const GuidePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [roadmapFocus, setRoadmapFocus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute("data-step"));
            if (!isNaN(step)) setActiveStep(step);
          }
        });
      },
      { threshold: 0.7 },
    );

    const stages = document.querySelectorAll("[data-step]");
    stages.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!roadmapFocus) return;
    setIsGenerating(true);
    try {
      const response = await axios.post("/api/analytics/report", {
        selectedModel: "Gemma 3 12B",
        focus: roadmapFocus,
        isRoadmap: true,
      });
      setGeneratedRoadmap(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="h-screen overflow-y-auto overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 scroll-smooth snap-y snap-mandatory"
      ref={containerRef}
    >
      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-emerald-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Redesigned Hero: Neural Blueprint Aesthetic */}
      <section className="min-h-screen flex items-center justify-center p-8 md:p-24 snap-start relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Advanced Background Grid & Neural Elements */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full" />

          {/* Animated "Blueprint" Lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 dark:opacity-40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M-100 200 L400 200 L600 400 L1200 400"
              stroke="currentColor"
              fill="transparent"
              strokeWidth="0.5"
              className="text-emerald-500"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500">
                  Operations Protocol // v3.0
                </span>
              </div>

              <h1 className="text-7xl md:text-9xl font-[1000] uppercase italic tracking-tighter leading-[0.85] text-zinc-900 dark:text-zinc-50">
                Master <br />
                <span className="text-emerald-500">The Fix.</span>
              </h1>

              <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed">
                A high-fidelity guide to navigating the BugSense diagnostic
                environment and rapid resolution engine.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 items-center">
              <div className="flex items-center gap-4 group cursor-help">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-xl group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                  <Cpu size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Powered By
                  </div>
                  <div className="text-sm font-bold uppercase italic flex flex-col -gap-1">
                    <span>Google AI Studio</span>
                    {/* <span className="text-[9px] text-emerald-500/70 not-italic tracking-wider">
                      SnixleIndiaa Org
                    </span> */}
                  </div>
                </div>
              </div>

              <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase overflow-hidden"
                    >
                      <img
                        src={`https://i.pravatar.cc/100?u=${i}`}
                        alt="user"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-black uppercase tracking-tight text-zinc-400">
                  JOINED BY{" "}
                  <span className="text-zinc-900 dark:text-zinc-50">
                    4.2K+ DEBUGGERS
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            {/* High-Fidelity Logo Presentation */}
            <div className="relative z-10 w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
              <div className="relative h-full w-full rounded-[60px] bg-zinc-950 border border-white/10 p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src="/media/bug_sense_logo.png"
                  alt="BugSense Brand"
                  className="w-full h-full object-contain relative z-10 filter brightness-110 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Floating Technical Specs Indicators */}
              <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl space-y-1">
                <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500">
                  Latency
                </div>
                <div className="text-xs font-mono font-bold text-white">
                  0.02ms
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 p-6 rounded-[30px] bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    System Accuracy
                  </div>
                  <div className="text-sm font-black italic text-white uppercase tracking-tighter">
                    99.8% Veracity
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-400">
            Initialize Guide
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
        </motion.div>
      </section>

      {/* Guide Stages - Alternating Layout Redesign */}
      {guideData.map((step, idx) => (
        <section
          key={idx}
          data-step={idx}
          className="py-24 md:py-40 flex items-center justify-center p-8 lg:p-24 snap-start relative border-b border-zinc-100 dark:border-zinc-900 last:border-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center max-w-6xl mx-auto w-full">
            {/* Text Side */}
            <div
              className={`space-y-10 order-2 ${idx % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
            >
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/10 italic">
                    {step.step}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Process Phase // {step.subtitle}
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.9] text-zinc-900 dark:text-zinc-50">
                    {step.title}
                  </h2>
                  <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 flex gap-4 backdrop-blur-sm group">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Lightbulb size={18} />
                  </div>
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                    “{step.tips}”
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Visual Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, x: idx % 2 === 0 ? 30 : -30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 group order-1 ${idx % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}
            >
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
              />

              {/* Minimal Marker Overlay */}
              <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="px-3 py-1.5 rounded-full bg-zinc-950/90 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                    {step.marker}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Final Roadmap Section - Compact & Modern Redesign */}
      <section className="py-32 flex items-center justify-center p-8 snap-start relative bg-zinc-900 text-white overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-3xl w-full space-y-10 text-center relative">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-400 opacity-80 mb-2">
              <Cpu size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] ">
                Neural Roadmap
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Build your <span className="text-emerald-500">Plan.</span>
            </h2>
            <p className="text-zinc-400 text-base font-medium max-w-md mx-auto leading-relaxed">
              Describe your error or topic to generate a custom step-by-step
              resolution roadmap.
            </p>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/0 rounded-[24px] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex flex-col sm:flex-row gap-2 p-2 bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-sm transition-all group-focus-within:border-emerald-500/30 group-focus-within:bg-white/10">
              <div className="flex-1 flex items-center px-4">
                <Sparkles size={18} className="text-emerald-500/50 mr-3" />
                <input
                  type="text"
                  value={roadmapFocus}
                  onChange={(e) => setRoadmapFocus(e.target.value)}
                  placeholder="e.g., React Hydration Error, Docker Setup..."
                  className="w-full bg-transparent border-none py-4 text-white placeholder:text-zinc-600 focus:outline-none font-medium"
                />
              </div>
              <button
                onClick={handleGenerateRoadmap}
                disabled={isGenerating || !roadmapFocus}
                className="sm:px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 font-black uppercase tracking-widest text-xs rounded-[18px] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Zap size={16} fill="currentColor" />
                )}
                <span>{isGenerating ? "Analyzing..." : "Generate"}</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {generatedRoadmap && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="mt-12 text-left"
              >
                <div className="p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent">
                  <div className="p-8 rounded-[31px] bg-zinc-950 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                          <Cpu size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-wider text-emerald-500">
                          Generated Roadmap // {roadmapFocus}
                        </h3>
                      </div>
                      <button
                        onClick={() => setGeneratedRoadmap(null)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="bg-black/60 p-6 rounded-2xl border border-white/5 text-zinc-400 font-mono text-xs leading-loose whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950">
                      {generatedRoadmap}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Simple Indicator Nav */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-50">
        {[...Array(guideData.length + 2)].map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${activeStep === idx - 1 ? "bg-emerald-500 scale-150 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-800"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GuidePage;
