import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import useDebugStore from "../../store/debugStore";
import {
  Terminal,
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import ModelSelector from "./ModelSelector";

const StreamResponse = () => {
  const { 
    messages, 
    streamedResponse, 
    isStreaming, 
    error, 
    sendFollowUp, 
    sessionId, 
    setConfirmModalOpen,
    selectedModel,
    quotaCounts
  } = useDebugStore();

  const currentLimit = selectedModel.startsWith("Gemma") ? 14000 : 20;
  const isLimitReached = (quotaCounts[selectedModel] || 0) >= currentLimit;
  const [followUp, setFollowUp] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const scrollRef = useRef(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamedResponse]);

  const handleSend = () => {
    if (followUp.trim() && !isStreaming) {
      sendFollowUp(followUp);
      setFollowUp("");
    }
  };

  if (!messages.length && !isStreaming) return null;

  const cleanContent = (content) => {
    if (!content) return "";
    return content.replace(/__JSON_META__[\s\S]*?__JSON_META__/g, "").trim();
  };

  const markdownComponents = {
    h1: ({ ...props }) => (
      <h1
        className="text-xl font-bold mt-12 mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 first:mt-0 tracking-tight text-zinc-900 dark:text-zinc-100"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="text-lg font-bold mt-10 mb-4 flex items-center gap-2 first:mt-0 tracking-tight text-zinc-900 dark:text-zinc-100"
        {...props}
      />
    ),
    p: ({ ...props }) => (
      <p className="mb-6 last:mb-0 leading-relaxed text-[15px] text-zinc-600 dark:text-zinc-400" {...props} />
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = match || String(children).includes("\n");
      
      if (isBlock) {
        return (
          <div className="relative group/code my-8">
            <div className="absolute -top-3 right-4 px-2 py-1 rounded bg-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-widest opacity-0 group/code:opacity-100 transition-opacity">
              {match ? match[1] : 'code'}
            </div>
            <pre className="p-5 overflow-x-auto max-h-[500px] scrollbar-thin text-[13px] bg-zinc-950 border border-zinc-800/50 rounded-2xl font-mono leading-relaxed shadow-xl">
              <code className="block text-zinc-300" {...props}>{children}</code>
            </pre>
          </div>
        );
      }
      
      return (
        <code
          className="bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono text-[13px] text-emerald-600 dark:text-emerald-400"
          {...props}
        >
          {children}
        </code>
      );
    },
    ul: ({ ...props }) => <ul className="space-y-3 mb-6 list-none" {...props} />,
    li: ({ children, ...props }) => {
      const content = String(children);
      if (content.startsWith('[ ]') || content.startsWith('[x]')) {
        const isChecked = content.startsWith('[x]');
        return (
          <li className="flex items-start gap-3 group" {...props}>
            <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700 bg-white/5 dark:bg-zinc-800'}`}>
              {isChecked && <CheckCircle2 size={10} />}
            </div>
            <span className="text-[14px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
              {content.substring(3).trim()}
            </span>
          </li>
        );
      }
      return (
        <li className="flex items-start gap-3" {...props}>
          <div className="mt-2.5 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-[14px] leading-relaxed">{children}</span>
        </li>
      );
    },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Messages List */}
      <div
        ref={scrollRef}
        className="flex-1 h-0 overflow-y-auto scrollbar-thin scroll-smooth"
      >
        <div className="max-w-7xl w-full mx-auto p-4 md:p-10 space-y-8 transition-all duration-500">
          {messages.length > 0 && (
            <div className="flex flex-col gap-6">
              {/* Turn 0: The Root Context + Initial Analysis */}
              <div id="msg-0" className="relative pl-6 border-l-2 border-emerald-500/20 py-2">
                <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Root_Session_Context
                  </span>
                  <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="p-4 mb-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[13px] text-zinc-600 dark:text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                  {typeof messages[0].content === 'string' 
                    ? messages[0].content 
                    : JSON.stringify(messages[0].content, null, 2)}
                </div>

                {/* Primary Evaluation (First AI Response) */}
                {messages[1] && (
                  <div id="msg-1" className="animate-in fade-in duration-700">
                    <div className="flex items-center justify-between w-full px-1 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-sm">
                          <Sparkles size={10} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">
                          Primary_Evaluation
                        </span>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-200 shadow-sm overflow-hidden">
                      <div
                        className="prose prose-zinc dark:prose-invert max-w-none break-words
                        prose-p:text-[15px] prose-p:leading-8 prose-p:text-zinc-600 dark:prose-p:text-zinc-400
                        prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold
                        prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-xl
                        prose-blockquote:border-l-4 prose-blockquote:border-emerald-500/20 prose-blockquote:bg-emerald-500/5 dark:prose-blockquote:bg-emerald-500/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-zinc-500
                        prose-hr:border-zinc-100 dark:prose-hr:border-zinc-800 prose-hr:my-8
                        prose-li:marker:text-emerald-500 prose-li:text-[15px]
                      "
                      >
                        <ReactMarkdown components={markdownComponents}>
                          {cleanContent(messages[1].content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subsequent Follow-up Dialogue */}
              {messages
                .slice(2)
                .reduce((turns, msg, i) => {
                  if (msg.role === "user") turns.push([msg]);
                  else if (turns.length > 0) turns[turns.length - 1].push(msg);
                  return turns;
                }, [])
                .map((turn, turnIdx) => (
                  <div
                    key={turnIdx}
                    className="space-y-6 relative pl-6 border-l-2 border-zinc-100 dark:border-zinc-800 py-1 pb-4"
                  >
                    {/* TURN MARKER */}
                    <div className="absolute -left-[3px] top-6 w-1 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />

                    {turn.map((msg, msgIdx) => (
                      <div
                        id={`msg-${(turnIdx + 1) * 2 + msgIdx}`}
                        key={msgIdx}
                        className="group animate-in fade-in slide-in-from-bottom-1 duration-500"
                      >
                        {msg.role === "user" ? (
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-[11px] font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                              Entry_Point_{turnIdx + 2}
                            </span>
                            <span className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                              "{msg.content}"
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between w-full px-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
                                  Diagnostic_Deep_Dive
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    cleanContent(msg.content),
                                    turnIdx,
                                  )
                                }
                                className="text-zinc-400 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                {copiedId === turnIdx ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-200 shadow-sm border-l-emerald-500/20 border-l-4 overflow-hidden">
                              <div
                                className="prose prose-zinc dark:prose-invert max-w-none break-words
                                prose-p:text-[14px] prose-p:leading-7 prose-p:text-zinc-600 dark:prose-p:text-zinc-400
                                prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold
                                prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-xl
                                prose-blockquote:border-l-4 prose-blockquote:border-emerald-500/20 prose-blockquote:bg-emerald-500/5 dark:prose-blockquote:bg-emerald-500/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-zinc-500
                                prose-hr:border-zinc-100 dark:prose-hr:border-zinc-800 prose-hr:my-8
                                prose-li:marker:text-emerald-500 prose-li:text-[14px]
                              "
                              >
                                <ReactMarkdown components={markdownComponents}>
                                  {cleanContent(msg.content)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}

          {/* Streaming / Thinking State */}
          {(isStreaming || streamedResponse) && (
            <div className="pl-6 border-l-2 border-emerald-500/20 py-1 transition-all animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-3 px-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">
                  {streamedResponse ? "Generating Analysis" : "Processing Intelligence"}
                </span>
              </div>
              
              <div className={`p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 text-[14px] leading-relaxed shadow-lg shadow-emerald-500/5 w-full overflow-hidden ${!streamedResponse ? 'opacity-50' : ''}`}>
                {!streamedResponse ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-3/4" />
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/2" />
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-5/6" />
                  </div>
                ) : (
                  <div className="prose prose-zinc dark:prose-invert max-w-none break-words
                    prose-p:text-[15px] prose-p:leading-8 prose-p:text-zinc-600 dark:prose-p:text-zinc-400
                    prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold
                    prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-xl
                    prose-li:marker:text-emerald-500 prose-li:text-[15px]">
                    <ReactMarkdown components={markdownComponents}>
                      {cleanContent(streamedResponse)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}


          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between group/error">
              <div className="flex items-center gap-3">
                <RotateCcw size={14} className="animate-pulse" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => useDebugStore.getState().retryAnalysis()}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-rose-600/20 flex items-center gap-2"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl w-full mx-auto relative group">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-xl group-focus-within:bg-emerald-500/10 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 mb-2 px-1 relative z-10">
             <ModelSelector position="up" />
             <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
             <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
               <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                 System Ready
               </span>
             </div>
          </div>
          <div className="relative flex items-end gap-2 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/30 transition-all">
            <textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a clarifying question..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] py-2.5 px-3 resize-none overflow-y-auto max-h-32 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 scrollbar-none"
            />
            <button
              onClick={() => !isLimitReached && handleSend()}
              disabled={!followUp.trim() || isStreaming || isLimitReached}
              className={`p-2.5 mb-0.5 text-white rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0 ${
                isLimitReached 
                  ? "bg-rose-500/20 text-rose-500 cursor-not-allowed shadow-none" 
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 disabled:opacity-20"
              }`}
            >
              {isLimitReached ? <RotateCcw size={14} /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamResponse;
