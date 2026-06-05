import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useDebugStore from "../../store/debugStore";
import { useUiStore } from "../../store/uiStore";
import ConfirmModal from "./ConfirmModal";
import PublishingModal from "./PublishingModal";
import StreamResponse from "./StreamResponse";
import { MANISH_LABS_URL } from "../../config/links";
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  RotateCw,
  ArrowUpRight,
} from "lucide-react";

const ChatPage = () => {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [isResizing, setIsResizing] = useState(false);
  const [isPublishingModalOpen, setIsPublishingModalOpen] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedArticle, setPublishedArticle] = useState(null);

  const {
    isLogsOpen,
    logStackWidth: leftWidth,
    setLogsOpen: setIsLogsOpen,
    setLogStackWidth: setLeftWidth,
  } = useUiStore();

  const {
    sessionId: activeSessionId,
    pastSessions,
    isConfirmModalOpen,
    setConfirmModalOpen,
    messages,
    loadSession,
    renameSession,
  } = useDebugStore();

  // Inline chat-title editing in the header.
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef(null);
  const cancelEditRef = useRef(false);

  const currentSessionObj =
    pastSessions.find((s) => s._id === activeSessionId) || null;
  const isFixed = currentSessionObj?.confirmedFix?.isConfirmed || false;
  const isPublished = currentSessionObj?.articleId ? true : false;

  const handlePublish = async () => {
    setIsPublishingModalOpen(true);
    setPublishError(null);
    setPublishSuccess(false);
    try {
      const result = await useDebugStore
        .getState()
        .publishOnly(activeSessionId);
      setPublishedArticle(result);
      setPublishSuccess(true);
    } catch (err) {
      setPublishError(err.message || "Failed to publish article");
    }
  };

  // Route Synchronization Effect
  useEffect(() => {
    if (urlSessionId) {
      if (urlSessionId !== activeSessionId) {
        loadSession(urlSessionId);
      }
    } else {
      navigate("/");
    }
  }, [urlSessionId, activeSessionId, loadSession, navigate]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const container = document.getElementById("workspace-container");
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newWidth = (x / rect.width) * 100;

      if (newWidth > 15 && newWidth < 60) {
        setLeftWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const scrollToMessage = (msgIndex) => {
    const el = document.getElementById(`msg-${msgIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatChatTitle = (session) => {
    if (session?.title) return session.title;
    const raw = session?.rawError;
    if (!raw) return "Analyzing bug...";
    const firstLine = raw.split("\n")[0];
    return firstLine
      .replace(
        /^(Uncaught\s+)?(TypeError|ReferenceError|Error|SyntaxError|EvalError|RangeError|URIError):\s*/i,
        "",
      )
      .replace(/^(\[object\s+Object\]|\{.*\})\s*/i, "Bug Details")
      .substring(0, 50);
  };

  const startEditTitle = () => {
    if (!activeSessionId || !currentSessionObj) return;
    cancelEditRef.current = false;
    setTitleDraft(formatChatTitle(currentSessionObj));
    setEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const saveTitle = () => {
    setEditingTitle(false);
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }
    const next = titleDraft.trim();
    if (next && currentSessionObj && next !== formatChatTitle(currentSessionObj)) {
      renameSession(activeSessionId, next);
    }
  };

  return (
    <div
      className={`flex h-full bg-white dark:bg-[#0d0d0d] overflow-hidden relative ${isResizing ? "cursor-col-resize select-none" : ""}`}
    >
      <ConfirmModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setConfirmModalOpen(false)} 
        onConfirm={async (note, publish, authorDisplay) => {
          setConfirmModalOpen(false);

          if (publish) {
            setIsPublishingModalOpen(true);
            setPublishError(null);
            setPublishSuccess(false);
            try {
              const result = await useDebugStore.getState().confirmFix(activeSessionId, note, publish, authorDisplay);
              setPublishedArticle(result);
              setPublishSuccess(true);
            } catch (err) {
              setPublishError(err.message || "Failed to publish article");
            }
          } else {
            try {
              await useDebugStore.getState().confirmFix(activeSessionId, note, publish, authorDisplay);
            } catch (err) {
              console.error("Failed to mark as fixed:", err);
            }
          }
        }} 
        sessionId={activeSessionId}
      />

      <PublishingModal
        isOpen={isPublishingModalOpen}
        isError={!!publishError}
        isSuccess={publishSuccess}
        articleData={publishedArticle}
        errorMessage={publishError}
        onRetry={() => {
          setPublishError(null);
          handlePublish();
        }}
        onClose={() => {
          setIsPublishingModalOpen(false);
          setPublishSuccess(false);
        }}
      />

      <div
        id="workspace-container"
        className="flex-1 flex flex-col md:flex-row h-full overflow-hidden transition-colors duration-300"
      >
        {/* Bug History */}
        <div
          style={{
            width: isLogsOpen ? `${leftWidth}%` : "0",
            minWidth: isLogsOpen ? "280px" : "0",
          }}
          className={`transition-all ${!isResizing && "duration-500"} cubic-bezier(0.4, 0, 0.2, 1) flex flex-col h-full overflow-hidden border-r border-zinc-200/50 dark:border-zinc-800/50`}
        >
          <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950">
            <div className="h-12 px-5 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 shrink-0">
              <button
                onClick={() => setIsLogsOpen(false)}
                className="flex items-center gap-1.5 py-1.5 pl-2 pr-3 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
              >
                <ChevronLeft size={15} />
                <span className="text-[11px] font-semibold tracking-wide leading-none">
                  Bug History
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter((m) => m.role === "user")
                .map((msg, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToMessage(idx * 2)}
                    className="w-full group text-left p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-850/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Hash size={12} className="text-zinc-400" />
                        <span className="text-[10px] font-semibold text-zinc-500 tracking-wide">
                          Entry {idx + 1}
                        </span>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-950 dark:group-hover:text-white transition-all"
                      />
                    </div>
                    <p className="text-[12px] font-mono text-zinc-650 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Resizer Divider */}
        {isLogsOpen && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 h-full cursor-col-resize hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors z-20 ${isResizing ? "bg-zinc-400 dark:bg-zinc-600" : "bg-transparent"}`}
          />
        )}

        {/* Diagnostic Response Section */}
        <div className="flex-1 flex flex-col h-full min-w-[400px] overflow-hidden relative bg-white dark:bg-[#0d0d0d]">
          <div className="h-12 px-6 flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-850/40 shrink-0 bg-white/85 dark:bg-[#0d0d0d]/85 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {!isLogsOpen && (
                <button
                  onClick={() => setIsLogsOpen(true)}
                  data-tooltip="Show bug history"
                  data-tip-pos="bottom"
                  className="flex items-center gap-1.5 py-1.5 pl-2 pr-2.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200 shrink-0"
                >
                  <ChevronRight size={15} />
                  <span className="text-[11px] font-semibold tracking-wide leading-none hidden sm:inline">
                    Bug History
                  </span>
                </button>
              )}
              {!isLogsOpen && <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 hidden sm:block shrink-0" />}
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveTitle();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      cancelEditRef.current = true;
                      setEditingTitle(false);
                    }
                  }}
                  maxLength={80}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none focus:ring-0 p-0 text-[13.5px] font-medium text-zinc-900 dark:text-white"
                />
              ) : (
                <h2
                  onClick={startEditTitle}
                  data-tooltip="Click to rename"
                  data-tip-pos="bottom"
                  className="text-[13.5px] font-medium text-zinc-700 dark:text-zinc-200 truncate cursor-text hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {formatChatTitle(currentSessionObj)}
                </h2>
              )}
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center gap-2 shrink-0 pl-3">
              <a
                href={MANISH_LABS_URL}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Manish Labs <ArrowUpRight size={12} className="opacity-60" />
              </a>
              {messages.length >= 2 && activeSessionId && (
                <>
                  <div className="hidden lg:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
                  {!isFixed && (
                    <button
                      onClick={() => setConfirmModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-[12px] font-semibold tracking-wide transition-colors active:scale-[0.98] animate-in fade-in"
                    >
                      <CheckCircle2 size={14} />
                      Mark as fixed
                    </button>
                  )}
                  {isFixed && !isPublished && (
                    <button
                      onClick={handlePublish}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700/50 rounded-lg text-[12px] font-semibold tracking-wide transition-colors active:scale-[0.98] animate-in fade-in"
                    >
                      <BookOpen size={14} className="text-zinc-400" />
                      Publish to Library
                    </button>
                  )}
                  {isFixed && isPublished && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-500">
                      <button
                        onClick={() => navigate(`/library/${currentSessionObj.articleId?.slug || currentSessionObj.articleId?.id || currentSessionObj.articleId}`)}
                        className="group flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[11.5px] font-semibold tracking-wide transition-all active:scale-[0.98]"
                      >
                        <CheckCircle2 size={13} className="group-hover:scale-110 transition-transform" />
                        Published <span className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">→ View</span>
                      </button>
                      <button
                        onClick={handlePublish}
                        data-tooltip="Sync / update article"
                        data-tip-pos="bottom"
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                      >
                        <RotateCw size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            <StreamResponse />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
