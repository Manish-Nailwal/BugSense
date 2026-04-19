import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import useLibraryStore from "../../store/libraryStore";
import {
  ChevronLeft,
  Share2,
  Eye,
  Calendar,
  CornerDownRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Clock,
  Bookmark,
  MessageSquare,
  ArrowRight,
  Zap,
  Globe,
  Award,
  TrendingUp,
} from "lucide-react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentArticle, isLoading, fetchArticle } = useLibraryStore();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: currentArticle.title,
        url: window.location.href,
      });
    } catch (err) {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  useEffect(() => {
    fetchArticle(slug);
    window.scrollTo(0, 0);
  }, [slug, fetchArticle]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#09090b] h-full space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
          <Loader2
            className="animate-spin text-emerald-500 relative"
            size={48}
          />
        </div>
        <span className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.4em] animate-pulse">
          Loading Article...
        </span>
      </div>
    );
  }

  if (!currentArticle) return null;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 pb-40 selection:bg-emerald-500/30 scroll-smooth scrollbar-none pt-32">
      <Helmet>
        <title>{currentArticle.title} | BugSense Library</title>
        <meta name="description" content={currentArticle.metaDescription} />
      </Helmet>

      {/* ── Reading Progress ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400 origin-left z-[100] shadow-[0_2px_15px_rgba(16,185,129,0.3)]"
        style={{ scaleX }}
      />

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative">
        {/* ── Navigation ── */}
        <nav className="flex items-center justify-between mb-16 relative z-10">
          <Link
            to="/library"
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all uppercase tracking-[0.2em] group shadow-sm hover:shadow-emerald-500/5 active:scale-95"
          >
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Library
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-10 h-10 rounded-2xl border transition-all active:scale-90 group flex items-center justify-center ${
                isBookmarked
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:text-emerald-500"
              }`}
            >
              <Bookmark
                size={16}
                className={
                  isBookmarked ? "fill-current" : "group-hover:fill-current"
                }
              />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-90 group"
            >
              <Share2 size={16} />
            </button>
          </div>
        </nav>

        {/* ── Hero Section ── */}
        <header className="relative mb-12 lg:mb-16">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-5xl space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5">
                <Globe size={10} />
                Verified Fix
              </div>
              <div className="h-px w-16 bg-gradient-to-r from-emerald-500/50 to-transparent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-[72px] font-[1000] tracking-[-0.05em] text-zinc-900 dark:text-white leading-[0.95] italic select-none"
            >
              {currentArticle.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4"
            >
              <div className="flex items-center gap-2.5 group font-bold">
                <Calendar size={14} className="text-zinc-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  {new Date(currentArticle.publishedAt).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2.5 group">
                <Clock size={14} className="text-zinc-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  8 MIN READ
                </span>
              </div>

              <div className="flex items-center gap-2.5 group font-bold">
                <Eye size={14} className="text-zinc-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  {currentArticle.views || 0} VIEWS
                </span>
              </div>
            </motion.div>

            {/* Author Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[32px] backdrop-blur-3xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center font-black text-emerald-500 text-sm shadow-lg">
                  {currentArticle.authorId?.displayName
                    ?.substring(0, 2)
                    .toUpperCase() || "AL"}
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em]">
                    Documented By
                  </p>
                  <p className="text-[15px] font-black text-zinc-900 dark:text-white">
                    {currentArticle.authorId?.displayName || "BugSense Expert"}
                  </p>
                </div>
              </div>

              <div className="hidden md:block w-px h-12 bg-zinc-200 dark:bg-zinc-800 mx-4" />

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase">
                    Verified by{" "}
                    <span className="text-emerald-500 font-extrabold italic">
                      Community Experts
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "98%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500">
                    98% SUCCESS RATE
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ── Main Layout ── */}
        <div className="relative block">
          {/* ── Article Info Sidebar ── */}
          <aside className="hidden lg:block float-right w-[350px] ml-16 mb-16 relative z-10">
            <div className="space-y-10 pt-12">
              <div className="p-8 rounded-[40px] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80 space-y-8 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Solution Specs
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 text-center">
                        Accuracy
                      </p>
                      <p className="text-2xl font-[1000] text-emerald-500 italic text-center">
                        98%
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 text-center">
                        Views
                      </p>
                      <p className="text-2xl font-[1000] text-blue-500 italic text-center">
                        {currentArticle.views || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      Technologies Used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentArticle.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[9px] font-black text-zinc-500 uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all relative z-10 shadow-xl"
                >
                  {showCopyFeedback ? "Copied Link!" : "Copy Article Link"}
                </button>
              </div>

              {/* Pro Promotion */}
              <div className="relative p-10 rounded-[48px] bg-emerald-600 group overflow-hidden cursor-pointer active:scale-95 transition-all shadow-2xl">
                <div className="relative text-center space-y-6">
                  <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div className="space-y-2 text-white">
                    <h4 className="text-2xl font-[1000] tracking-tighter italic">
                      Scale Your Vision.
                    </h4>
                    <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest">
                      Get BugSense Pro for unlimited private fixes.
                    </p>
                  </div>
                  <div className="py-4 bg-zinc-950 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] group-hover:scale-105 transition-transform">
                    Upgrade to Pro
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Article Contents */}
          <main className="min-w-0">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="text-[48px] font-[1000] tracking-[-0.04em] mt-24 mb-12 pb-6 border-b border-zinc-100 dark:border-zinc-800 italic leading-none"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="text-[32px] font-black tracking-tighter mt-20 mb-8 border-l-[6px] border-emerald-500 pl-6 italic"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="text-[20px] font-black mt-12 mb-6 tracking-tight flex items-center gap-3 uppercase text-zinc-700 dark:text-zinc-300"
                      {...props}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {props.children}
                    </h3>
                  ),
                  p: ({ ...props }) => (
                    <p
                      className="mb-8 leading-[1.85] text-[18px] text-zinc-600 dark:text-zinc-400 font-medium"
                      {...props}
                    />
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = match || String(children).includes("\n");

                    if (isBlock) {
                      return (
                        <div className="relative my-12 md:my-16">
                          <pre className="relative p-6 md:p-10 overflow-x-auto bg-zinc-950 rounded-[40px] font-mono text-[13px] md:text-[15px] leading-relaxed shadow-3xl">
                            <code className="text-zinc-300" {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code
                        className="bg-emerald-500/10 px-2.5 py-1 rounded-xl font-mono text-[14px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ ...props }) => (
                    <div className="relative my-20 p-10 bg-zinc-50 dark:bg-zinc-900 shadow-inner rounded-[48px]">
                      <blockquote
                        className="italic text-[20px] font-bold text-zinc-900 dark:text-zinc-100"
                        {...props}
                      />
                    </div>
                  ),
                }}
              >
                {currentArticle.content.trim()}
              </ReactMarkdown>
            </div>

            {/* Simple Footer */}
            <footer className="mt-32 p-12 lg:p-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[60px] text-center space-y-8">
                <div className="w-20 h-20 rounded-[28px] bg-emerald-500 flex items-center justify-center text-white mx-auto shadow-2xl">
                  <Zap size={36} fill="currentColor" />
                </div>
                <div className="max-w-xl mx-auto space-y-4">
                  <h3 className="text-4xl font-black tracking-tighter italic">
                    Solution Verified.
                  </h3>
                  <p className="text-[16px] text-zinc-500 font-medium leading-relaxed">
                    This fix has been tested and confirmed by the BugSense engineering community.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl text-[14px] font-black uppercase shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Start New Session
                </button>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
