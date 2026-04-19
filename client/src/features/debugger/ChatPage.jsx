import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useDebugStore from "../../store/debugStore";
import { useUiStore } from "../../store/uiStore";
import ConfirmModal from "./ConfirmModal";
import PublishingModal from "./PublishingModal";
import StreamResponse from "./StreamResponse";
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  RotateCw,
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
    isStreaming,
  } = useDebugStore();

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
    if (!raw) return "INITIALIZING_CONTEXT...";
    const firstLine = raw.split("\n")[0];
    // Clean common error prefixes to make it "meaningful" like ChatGPT
    return firstLine
      .replace(
        /^(Uncaught\s+)?(TypeError|ReferenceError|Error|SyntaxError|EvalError|RangeError|URIError):\s*/i,
        "",
      )
      .replace(/^(\[object\s+Object\]|\{.*\})\s*/i, "Dynamic Context")
      .substring(0, 50);
  };

  return (
    <div
      className={`flex h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative ${isResizing ? "cursor-col-resize select-none" : ""}`}
    >
      <ConfirmModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setConfirmModalOpen(false)} 
        onConfirm={async (note, publish) => {
          setConfirmModalOpen(false);
          
          if (publish) {
            // Trigger the Publishing Modal flow
            setIsPublishingModalOpen(true);
            setPublishError(null);
            setPublishSuccess(false);
            try {
              const result = await useDebugStore.getState().confirmFix(activeSessionId, note, publish);
              setPublishedArticle(result);
              setPublishSuccess(true);
            } catch (err) {
              setPublishError(err.message || "Failed to publish article");
            }
          } else {
            // Just mark as fixed without showing publishing progress
            try {
              await useDebugStore.getState().confirmFix(activeSessionId, note, publish);
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
        {/* Log Stack (Input History) */}
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
                className="flex items-center gap-2 py-1.5 px-3 pr-4 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200 group"
              >
                <ChevronLeft size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mt-0.5 opacity-80 group-hover:opacity-100">
                  Log Stack
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
                    className="w-full group text-left p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          Entry #{idx + 1}
                        </span>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-zinc-700 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all"
                      />
                    </div>
                    <p className="text-[12px] font-mono text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
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
            className={`w-1 h-full cursor-col-resize hover:bg-emerald-500/50 transition-colors z-20 ${isResizing ? "bg-emerald-500" : "bg-transparent"}`}
          />
        )}

        {/* Diagnostic Response Section */}
        <div className="flex-1 flex flex-col h-full min-w-[400px] overflow-hidden relative bg-white dark:bg-zinc-950">
          <div className="h-12 px-6 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 shrink-0 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              {!isLogsOpen && (
                <button
                  onClick={() => setIsLogsOpen(true)}
                  className="flex items-center gap-2 py-1.5 px-3 pr-4 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-all duration-200 group"
                >
                  <ChevronRight size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5 opacity-80 group-hover:opacity-100">
                    LOG_STACK
                  </span>
                </button>
              )}
              <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] truncate max-w-[400px]">
                {formatChatTitle(currentSessionObj)}
              </h2>
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center">
              {messages.length >= 2 && activeSessionId && (
                <>
                  {!isFixed && (
                    <button
                      onClick={() => setConfirmModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors animate-in fade-in"
                    >
                      <CheckCircle2 size={14} />
                      Mark as Fixed
                    </button>
                  )}
                  {isFixed && !isPublished && (
                    <button
                      onClick={handlePublish}
                      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700/50 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors animate-in fade-in"
                    >
                      <BookOpen size={14} className="text-zinc-400" />
                      Publish to Library
                    </button>
                  )}
                  {isFixed && isPublished && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-1 duration-500">
                      <button
                        onClick={() => navigate(`/library/${currentSessionObj.articleId?.slug || currentSessionObj.articleId?.id || currentSessionObj.articleId}`)}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <CheckCircle2 size={12} className="group-hover:scale-110 transition-transform" />
                        Published <span className="opacity-40 ml-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">→ View</span>
                      </button>
                      <button 
                        onClick={handlePublish}
                        title="Sync/Update Article"
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-emerald-500 rounded-full transition-colors"
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
