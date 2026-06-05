import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Library,
  MessageSquare,
  Eye,
  Clock,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Ghost,
  BadgeCheck,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useLibraryStore from '../../store/libraryStore';
import useDebugStore from '../../store/debugStore';

const formatSessionTitle = (session) => {
  if (session?.title) return session.title;
  const raw = session?.rawError || '';
  const firstLine = raw.split('\n')[0] || 'Untitled session';
  return firstLine
    .replace(/^(Uncaught\s+)?(TypeError|ReferenceError|Error|SyntaxError|EvalError|RangeError|URIError):\s*/i, '')
    .substring(0, 60) || 'Untitled session';
};

const WorkspacePage = () => {
  const { user } = useAuthStore();
  const { myArticles, fetchMyArticles, deleteArticle, updateArticleIdentity, isLoading: isLibraryLoading } = useLibraryStore();
  const { pastSessions, fetchSessions, deleteSession } = useDebugStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState(location.state?.tab === 'chats' ? 'chats' : 'blogs');
  // { type: 'article' | 'session', id, title }
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState(null); // blog whose Q&A panel is open

  useEffect(() => {
    if (user?._id) fetchMyArticles(user._id);
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === 'article') await deleteArticle(confirm.id);
      else await deleteSession(confirm.id);
    } catch {
      /* surfaced by the store */
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const tabs = [
    { key: 'blogs', label: 'Blogs', icon: Library, count: myArticles?.length || 0 },
    { key: 'chats', label: 'Conversations', icon: MessageSquare, count: pastSessions?.length || 0 },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 scrollbar-none">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">

        {/* Header */}
        <div className="mb-8 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-500">
            <Library size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Workspace</span>
          </div>
          <h1 className="text-2xl md:text-[1.7rem] font-semibold tracking-tight">My Workspace</h1>
          <p className="text-sm text-zinc-500">Manage your published blogs and debugging conversations.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 w-fit mb-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all ${
                  active
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Icon size={14} />
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'blogs' ? (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {isLibraryLoading ? (
                <div className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">Loading blogs…</span>
                </div>
              ) : myArticles?.length > 0 ? (
                myArticles.map((article) => {
                  const commentCount = article.comments?.length || 0;
                  const open = expandedId === article._id;
                  return (
                  <motion.div
                    key={article._id}
                    layout
                    className="group rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-500/30 transition-all overflow-hidden"
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {article.tags?.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{t}</span>
                          ))}
                        </div>
                        <h4 className="text-[15px] font-semibold tracking-tight group-hover:text-emerald-500 transition-colors leading-tight truncate">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] font-medium text-zinc-500 flex-wrap">
                          <span className="flex items-center gap-1.5"><Eye size={12} /> {article.views || 0}</span>
                          <span className="flex items-center gap-1.5"><Heart size={12} /> {article.likes || 0}</span>
                          <span className="flex items-center gap-1.5"><MessageCircle size={12} /> {commentCount}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {/* Blog identity toggle — flip name <-> anonymous anytime */}
                          <button
                            onClick={() => updateArticleIdentity(article._id, article.authorDisplay === 'anonymous' ? 'name' : 'anonymous')}
                            data-tooltip="Toggle how you're shown on this blog"
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all ${
                              article.authorDisplay === 'anonymous'
                                ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {article.authorDisplay === 'anonymous'
                              ? <><Ghost size={11} /> Anonymous</>
                              : <><BadgeCheck size={11} /> {user?.displayName || 'You'}</>}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/library/${article.slug}`)}
                          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-black text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink size={12} /> View
                        </button>
                        <button
                          onClick={() => setExpandedId(open ? null : article._id)}
                          data-tooltip="Reader Q&A"
                          className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                            open
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500'
                          }`}
                        >
                          <MessageCircle size={15} />
                          {commentCount > 0 && <span className="text-[10px] font-semibold tabular-nums">{commentCount}</span>}
                        </button>
                        {article.sessionId && (
                          <button
                            onClick={() => navigate(`/c/${article.sessionId}`)}
                            data-tooltip="View original chat"
                            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-all"
                          >
                            <MessageSquare size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirm({ type: 'article', id: article._id, title: article.title })}
                          data-tooltip="Unpublish"
                          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Reader Q&A — questions from readers + the author's replies */}
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-zinc-100 dark:border-zinc-800/70 overflow-hidden"
                        >
                          <div className="p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">Reader Q&amp;A</p>
                            {commentCount > 0 ? (
                              <div className="space-y-3">
                                {article.comments.map((c, i) => (
                                  <div key={c._id || i} className={`flex gap-2.5 ${c.isAuthorReply ? 'pl-7' : ''}`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0 ${c.isAuthorReply ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                                      {((c.isAuthorReply ? (user?.displayName || 'Y') : c.authorName || '?')[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">{c.isAuthorReply ? (user?.displayName || 'You') : c.authorName}</span>
                                        {c.isAuthorReply && <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Author</span>}
                                      </div>
                                      <p className="text-[12.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{c.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-center py-5 gap-2">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                  <MessageCircle size={18} />
                                </div>
                                <p className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">No questions yet</p>
                                <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">When readers ask about this fix, their questions show up here and you can reply to clear their doubts.</p>
                                <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400">Comments & replies coming soon</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  );
                })
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No published blogs yet"
                  hint="Resolve a bug and publish it to the library to see it here."
                  cta="Start a session"
                  onCta={() => navigate('/')}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              {pastSessions?.length > 0 ? (
                pastSessions.map((session) => (
                  <motion.div
                    key={session._id}
                    layout
                    className="group p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-4"
                  >
                    <button
                      onClick={() => navigate(`/c/${session._id}`)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                        <MessageSquare size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate group-hover:text-emerald-500 transition-colors">{formatSessionTitle(session)}</p>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500 mt-0.5">
                          {session.category && <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 uppercase tracking-wider">{session.category}</span>}
                          <span>{new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          {session.confirmedFix?.isConfirmed && (
                            <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={11} /> Fixed</span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/c/${session._id}`)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-black text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-600 transition-all"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setConfirm({ type: 'session', id: session._id, title: formatSessionTitle(session) })}
                        data-tooltip="Delete conversation"
                        className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations yet"
                  hint="Your debugging sessions will appear here."
                  cta="New debugging session"
                  onCta={() => navigate('/')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete / unpublish confirmation */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !busy && setConfirm(null)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-7 shadow-2xl space-y-5"
            >
              <div className="w-14 h-14 rounded-[20px] bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Trash2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  {confirm.type === 'article' ? 'Unpublish this blog?' : 'Delete this conversation?'}
                </h3>
                <p className="text-[13px] font-medium text-zinc-500 leading-relaxed">
                  {confirm.type === 'article'
                    ? <>The blog <span className="text-zinc-900 dark:text-zinc-200 font-semibold">"{confirm.title}"</span> will be removed from the public library. You can re-publish from the original chat later.</>
                    : <>The conversation <span className="text-zinc-900 dark:text-zinc-200 font-semibold">"{confirm.title}"</span> will be permanently deleted.</>}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  disabled={busy}
                  className="flex-1 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-[12px] font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={busy}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 text-white text-[12px] font-semibold uppercase tracking-wide shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {busy ? 'Working…' : confirm.type === 'article' ? 'Unpublish' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, hint, cta, onCta }) => (
  <div className="p-12 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
    <Icon className="mx-auto text-zinc-300 dark:text-zinc-700" size={32} />
    <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{title}</p>
    <p className="text-[12px] font-medium text-zinc-450">{hint}</p>
    <button
      onClick={onCta}
      className="mt-2 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider hover:underline"
    >
      {cta}
    </button>
  </div>
);

export default WorkspacePage;
