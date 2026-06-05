import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import useLibraryStore from "../../store/libraryStore";
import {
  ChevronLeft,
  Share2,
  Eye,
  Calendar,
  Loader2,
  CheckCircle2,
  Sparkles,
  Clock,
  Bookmark,
  ArrowUpRight,
  ShieldCheck,
  Award
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MANISH_LABS_URL } from "../../config/links";

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
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#09090b] min-h-screen space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-violet-500/20 blur-2xl rounded-full animate-pulse" />
          <Loader2
            className="animate-spin text-indigo-650 dark:text-violet-400 relative"
            size={40}
          />
        </div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
          Ingesting Solution...
        </span>
      </div>
    );
  }

  if (!currentArticle) return null;

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 pb-36 selection:bg-indigo-500/20 selection:text-indigo-650 dark:selection:bg-violet-500/20 dark:selection:text-violet-300 pt-28 relative">
      <Helmet>
        <title>{`${currentArticle.title} | Trace Library`}</title>
        <meta name="description" content={currentArticle.metaDescription || `Read “${currentArticle.title}”, a community-shared debugging solution on Trace.`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${currentArticle.title} | Trace Library`} />
        <meta property="og:description" content={currentArticle.metaDescription || `A debugging solution on Trace.`} />
        <meta property="og:site_name" content="Trace" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${currentArticle.title} | Trace Library`} />
        <meta name="twitter:description" content={currentArticle.metaDescription || `A debugging solution on Trace.`} />
      </Helmet>

      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-violet-500 dark:to-fuchsia-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Subtle Glows */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[400px] bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-violet-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-12 border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <Link
            to="/library"
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors uppercase tracking-wider group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Library
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                isBookmarked
                  ? "bg-indigo-600 border-indigo-600 text-white dark:bg-violet-600 dark:border-violet-600"
                  : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Bookmark size={15} className={isBookmarked ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center transition-all hover:bg-zinc-900 dark:hover:bg-zinc-100"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Hero Metadata */}
        <header className="space-y-6 mb-12">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-violet-400 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={12} className="animate-pulse" />
            Verified Technical Fix
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            {currentArticle.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {new Date(currentArticle.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              8 min read
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span className="flex items-center gap-1.5">
              <Eye size={13} />
              {currentArticle.views || 0} views
            </span>
          </div>

          {/* Author Block */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-850/80">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center font-bold text-xs text-indigo-400 dark:text-violet-500 shadow-sm">
              {currentArticle.authorId?.displayName?.substring(0, 2).toUpperCase() || "TL"}
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Documented By</p>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                {currentArticle.authorId?.displayName || "Trace Expert"}
              </p>
            </div>
          </div>
        </header>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Article Content (Spans 8 columns on lg) */}
          <main className="lg:col-span-8 min-w-0">
            <article className="prose prose-zinc dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-12 mb-6 pb-2.5 border-b border-zinc-100 dark:border-zinc-900 leading-tight" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mt-10 mb-4 border-l-4 border-indigo-500 dark:border-violet-500 pl-3.5 leading-snug" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-600 dark:text-violet-400 mt-8 mb-3 flex items-center gap-1.5" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="mb-5 leading-relaxed text-sm text-zinc-650 dark:text-zinc-400 font-medium" {...props} />
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = match || String(children).includes("\n");

                    if (isBlock) {
                      return (
                        <div className="relative my-6 font-mono text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                          <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-850/80 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            <span>Code Block</span>
                          </div>
                          <pre className="p-5 bg-zinc-950 text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            <code className="text-zinc-300" {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code className="bg-indigo-50 dark:bg-violet-950/40 px-2 py-0.5 rounded font-mono text-[13px] font-bold text-indigo-650 dark:text-violet-400 border border-indigo-100/50 dark:border-violet-900/30" {...props}>
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ ...props }) => (
                    <div className="relative my-8 p-6 bg-zinc-50 dark:bg-zinc-900 border-l-4 border-indigo-500 dark:border-violet-500 rounded-r-xl">
                      <blockquote className="italic text-sm font-medium text-zinc-800 dark:text-zinc-200" {...props} />
                    </div>
                  ),
                }}
              >
                {currentArticle.content.trim()}
              </ReactMarkdown>
            </article>

            {/* Premium Solution Verification Seal */}
            <footer className="mt-16 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-850/80 bg-zinc-50/50 dark:bg-[#0c0c0f]/60 backdrop-blur-sm flex flex-col sm:flex-row items-center gap-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 dark:bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Award size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Solution Verified by{" "}
                  <a
                    href={MANISH_LABS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors underline decoration-dotted underline-offset-2"
                  >
                    Manish Labs
                  </a>
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                  This architectural patch has been community reviewed and compiled through our active runtime diagnostic laboratory.
                </p>
              </div>
            </footer>
          </main>

          {/* Right Specs Column (Spans 4 columns on lg) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 pt-4">
            
            {/* Specs Card */}
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-550 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                Solution Specifications
              </div>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Accuracy Rating</span>
                  <span className="font-bold text-indigo-600 dark:text-violet-400 font-mono">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-450">Ingestion Verified</span>
                  <span className="font-bold text-zinc-900 dark:text-white">Yes</span>
                </div>
              </div>

              {/* Technologies list */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Target Stacks
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentArticle.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-xs font-bold transition-colors hover:bg-zinc-900 dark:hover:bg-zinc-100"
              >
                {showCopyFeedback ? "Link Copied!" : "Copy Reference Link"}
              </button>
            </div>

            {/* CTA panel */}
            <div className="p-6 rounded-xl bg-zinc-950 text-white space-y-4 shadow-xl text-center">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto text-violet-400">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold">Trace Premium</h5>
                <p className="text-[11px] text-zinc-400">
                  Unlock limitless code compilation and Socratic breakdowns.
                </p>
              </div>
              <button
                onClick={() => navigate("/auth/register")}
                className="w-full py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-lg text-xs font-bold transition-all active:scale-98"
              >
                Get Started Free
              </button>
              <a
                href={MANISH_LABS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Part of the Manish Labs ecosystem <ArrowUpRight size={11} />
              </a>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
};

export default ArticlePage;
