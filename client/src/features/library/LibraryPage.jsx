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
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white selection:bg-emerald-500/30 scroll-smooth pt-32 pb-40 relative">
      {/* ── Background Ambience ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[30%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1500px] mx-auto px-8 relative z-10">
        {/* ── Simplified Header ── */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-100 dark:border-zinc-800/50 pb-12">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]"
            >
              <Sparkles size={12} />
              Expert Guides
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-[1000] tracking-[-0.05em] leading-[0.9] italic uppercase"
            >
              The Fix <br />
              <span className="text-zinc-200 dark:text-zinc-800 transition-colors duration-1000">
                Library.
              </span>
            </motion.h1>
          </div>
          <div className="flex items-center gap-8 text-right">
            <div className="flex flex-col">
              <span className="text-3xl font-[1000] dark:text-white leading-none">
                14K+
              </span>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">
                Fixes Delivered
              </span>
            </div>
            <div className="w-px h-10 bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-3xl font-[1000] text-emerald-500 leading-none">
                99%
              </span>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">
                Helpful Rating
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* ── Industrial Side Panel ── */}
          <aside className="w-full lg:w-72 shrink-0 space-y-12 lg:sticky lg:top-36">
            {/* Simplified Search */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Search size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Search Library
                </span>
              </div>
              <form onSubmit={handleSearch} className="group">
                <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus-within:border-emerald-500/50 transition-all p-1 shadow-sm">
                  <input
                    type="text"
                    placeholder="Key terms or errors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold p-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                  />
                  <button
                    type="submit"
                    className="p-3 text-zinc-400 hover:text-emerald-500 transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>

            {/* Simple Technology Filters */}
            <div className="space-y-6">
              <div className="flex items-center justify-between group/header">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Filter size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
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
                    className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-tighter underline underline-offset-4"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap lg:flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => {
                    setActiveTag("");
                    fetchArticles(1, { q: searchTerm, tag: "" });
                  }}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    !activeTag
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-x-1"
                      : "bg-white dark:bg-zinc-900/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-zinc-100 dark:border-zinc-800"
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
                      className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border group flex items-center justify-between ${
                        activeTag === tag._id
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-x-1"
                          : "bg-white dark:bg-zinc-900/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-zinc-100 dark:border-zinc-800"
                      }`}
                    >
                      {tag._id}
                      <span
                        className={`text-[9px] font-mono group-hover:opacity-100 transition-opacity ${activeTag === tag._id ? "opacity-50" : "opacity-20"}`}
                      >
                        [{tag.count}]
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Simple Stats Card */}
            <div className="p-8 rounded-[40px] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80 space-y-6 hidden lg:block backdrop-blur-3xl">
              <div className="flex items-center gap-2 text-emerald-500">
                <Activity size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">
                  Knowledge Stats
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black">
                  <span className="text-zinc-500 uppercase tracking-tighter">
                    Guides Published
                  </span>
                  <span className="text-zinc-900 dark:text-white font-mono">
                    14,281
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-black">
                  <span className="text-zinc-500 uppercase tracking-tighter">
                    Success Rate
                  </span>
                  <span className="text-emerald-500 font-mono">99.9%</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Results Content ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-48 transition-all"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-150" />
                    <Loader2
                      className="animate-spin text-emerald-500 relative"
                      size={48}
                    />
                  </div>
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] animate-pulse">
                    Loading Fixes...
                  </span>
                </motion.div>
              ) : (
                <div className="space-y-20">
                  <motion.div
                    key={activeTag + searchTerm}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {articles.length > 0 ? (
                      articles.map((article) => (
                        <ArticleCard key={article._id} article={article} />
                      ))
                    ) : (
                      <div className="col-span-full py-48 text-center bg-zinc-50/50 dark:bg-zinc-900/10 rounded-[60px] border-2 border-dashed border-zinc-200 dark:border-zinc-800/50">
                        <p className="text-2xl font-black text-zinc-300 dark:text-zinc-800 uppercase italic">
                          No Fixes Found.
                        </p>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest mt-4">
                          Try searching different keywords.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTag("");
                            setSearchTerm("");
                            fetchArticles(1, { q: "", tag: "" });
                          }}
                          className="mt-10 text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest underline decoration-2 underline-offset-8"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 pt-12 border-t border-zinc-100 dark:border-zinc-800">
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
                          className={`w-12 h-12 rounded-xl text-[12px] font-black transition-all ${
                            pagination.currentPage === page
                              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl"
                              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-100 dark:border-zinc-800"
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
