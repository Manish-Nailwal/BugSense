import React, { useEffect, useState } from "react";
import useLibraryStore from "../../store/libraryStore";
import ArticleCard from "./ArticleCard";
import {
  Search,
  Loader2,
  Sparkles,
  Filter,
  ArrowRight,
  Zap,
  Globe,
  Cpu,
  Hash,
  Activity,
  Terminal,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LibraryPage = () => {
  const { articles, tags, pagination, isLoading, fetchArticles, fetchTags } =
    useLibraryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("");

  // Live search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(1, { q: searchTerm, tag: activeTag });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTag, fetchArticles]);

  useEffect(() => {
    fetchArticles();
    fetchTags();
  }, [fetchArticles, fetchTags]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(1, { q: searchTerm, tag: activeTag });
  };

  const toggleTag = (tag) => {
    const newTag = activeTag === tag ? "" : tag;
    setActiveTag(newTag);
    fetchArticles(1, { q: searchTerm, tag: newTag });
  };

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:bg-violet-500/20 dark:selection:text-violet-300 scroll-smooth pt-32 pb-40 relative">
      {/* ── Background Ambience ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 right-1/4 h-[400px] bg-indigo-500/5 dark:bg-violet-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* ── Simplified Header ── */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-200/50 dark:border-zinc-900/60 pb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-violet-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={12} className="animate-pulse" />
              Developer Ecosystem
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              The Fix Library
            </h1>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-md">
              Curated architectural solutions, exception diagnostics, and step-by-step mental models.
            </p>
          </div>
          <div className="flex items-center gap-8 text-right">
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold dark:text-white leading-none">
                14K+
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                Fixes Ingested
              </span>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-violet-400 leading-none">
                99%
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                Helpful Rating
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* ── Side Panel ── */}
          <aside className="w-full lg:w-64 shrink-0 space-y-10 lg:sticky lg:top-32">
            {/* Search Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Search size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Filter Content
                </span>
              </div>
              <form onSubmit={handleSearch} className="group">
                <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/15 focus-within:border-indigo-500 dark:focus-within:border-violet-500 dark:focus-within:ring-violet-500/15 transition-all p-1 shadow-sm">
                  <input
                    type="text"
                    placeholder="Search errors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-semibold p-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-450 dark:placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>

            {/* Technology Filters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Filter size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Technologies
                  </span>
                </div>
                {(activeTag || searchTerm) && (
                  <button
                    onClick={() => {
                      setActiveTag("");
                      setSearchTerm("");
                      fetchArticles(1, { q: "", tag: "" });
                    }}
                    className="text-[9px] font-bold text-indigo-600 dark:text-violet-400 uppercase tracking-widest hover:underline underline-offset-4"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap lg:flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar">
                <button
                  onClick={() => {
                    setActiveTag("");
                    fetchArticles(1, { q: searchTerm, tag: "" });
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                    !activeTag
                      ? "bg-zinc-950 border-zinc-950 dark:bg-white dark:border-white text-white dark:text-zinc-950 shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-900/30 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border-zinc-200/50 dark:border-zinc-800"
                  }`}
                >
                  All Guides
                </button>
                {[...tags]
                  .sort((a, b) => b.count - a.count)
                  .map((tag) => (
                    <button
                      key={tag._id}
                      onClick={() => toggleTag(tag._id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all border flex items-center justify-between ${
                        activeTag === tag._id
                          ? "bg-indigo-600 border-indigo-600 dark:bg-violet-600 dark:border-violet-600 text-white shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-900/30 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border-zinc-200/50 dark:border-zinc-800"
                      }`}
                    >
                      <span>{tag._id}</span>
                      <span
                        className={`text-[10px] font-mono ${activeTag === tag._id ? "text-indigo-200 dark:text-violet-200" : "text-zinc-400"}`}
                      >
                        {tag.count}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Knowledge Stats Card */}
            <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/80 space-y-4 hidden lg:block">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-violet-400">
                <Activity size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Knowledge Stats
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Guides</span>
                  <span className="font-bold text-zinc-900 dark:text-white font-mono">14,281</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Accuracy</span>
                  <span className="font-bold text-indigo-600 dark:text-violet-400 font-mono">99.9%</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Results Content ── */}
          <main className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-36"
                >
                  <div className="relative mb-6">
                    <Loader2
                      className="animate-spin text-indigo-600 dark:text-violet-400"
                      size={36}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
                    Ingesting guides...
                  </span>
                </motion.div>
              ) : (
                <div className="space-y-12">
                   <motion.div
                    key={`${activeTag}-${articles.length}-${isLoading}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {articles.length > 0 ? (
                      articles.map((article) => (
                        <ArticleCard key={article._id} article={article} />
                      ))
                    ) : (
                      <div className="col-span-full py-32 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/10">
                        <p className="text-lg font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                          No Fixes Found.
                        </p>
                        <p className="text-zinc-450 dark:text-zinc-500 text-xs mt-2">
                          Try searching different keywords or stack names.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTag("");
                            setSearchTerm("");
                            fetchArticles(1, { q: "", tag: "" });
                          }}
                          className="mt-6 text-xs font-bold text-indigo-600 dark:text-violet-400 hover:underline underline-offset-4"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-1.5 pt-8 border-t border-zinc-150 dark:border-zinc-900">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() =>
                            fetchArticles(page, {
                              q: searchTerm,
                              tag: activeTag,
                            })
                          }
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                            pagination.currentPage === page
                              ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800/80"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
