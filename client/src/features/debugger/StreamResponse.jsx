import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import useDebugStore from "../../store/debugStore";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Share2,
  MoreHorizontal,
  ArrowUpRight
} from "lucide-react";
import AttachMenu from "./AttachMenu";
import { MAX_INPUT_CHARS, INPUT_WARN_AT } from "../../config/limits";
import { MANISH_LABS_URL } from "../../config/links";

/**
 * Self-contained CopyButton for code blocks to prevent state leakage
 */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-zinc-400 font-semibold"
    >
      {copied ? (
        <>
          <Check size={11} className="text-emerald-500" />
          <span className="text-emerald-500 text-[10px] uppercase tracking-wider">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={11} />
          <span className="text-[10px] uppercase tracking-wider">Copy</span>
        </>
      )}
    </button>
  );
};

/**
 * Self-contained CopyButton for the entire message response
 */
const CopyMessageButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      data-tooltip="Copy response"
      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
};

const StreamResponse = () => {
  const {
    messages,
    streamedResponse,
    isStreaming,
    error,
    sendFollowUp,
    deepMode,
    quota
  } = useDebugStore();

  // Standard follow-ups draw from the shared pool; Deep Mode has its own allowance.
  const isLimitReached = !deepMode && quota?.normal && !quota.normal.available;
  const [followUp, setFollowUp] = useState("");
  const scrollRef = useRef(null);
  const followUpRef = useRef(null);

  // Longer prompts get a slightly wider bar for breathing room.
  const isWide = followUp.length > 140 || followUp.includes("\n");
  const nearLimit = followUp.length >= INPUT_WARN_AT;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamedResponse]);

  // Auto-grow the follow-up textarea up to ~8 lines.
  useEffect(() => {
    const el = followUpRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [followUp]);

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
        className="text-lg font-bold mt-8 mb-4 border-b border-zinc-100 dark:border-zinc-850 pb-2 first:mt-0 tracking-tight text-zinc-900 dark:text-zinc-100 font-sans"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="text-base font-bold mt-6 mb-3 tracking-tight text-zinc-900 dark:text-zinc-100 font-sans"
        {...props}
      />
    ),
    p: ({ ...props }) => (
      <p className="mb-4 last:mb-0 leading-relaxed text-[14.5px] text-zinc-650 dark:text-zinc-350 font-normal" {...props} />
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = match || String(children).includes("\n");
      
      if (isBlock) {
        const lang = match ? match[1] : 'code';
        const codeText = String(children).trim();
        return (
          <div className="relative my-5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#0d0d0d] shadow-md group/code">
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-[#18181b] border-b border-zinc-250 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
              <span>{lang}</span>
              <CopyButton text={codeText} />
            </div>
            <pre className="p-4 overflow-x-auto max-h-[500px] scrollbar-thin text-[12.5px] bg-[#0d0d0d] font-mono leading-relaxed text-zinc-350">
              <code className="block text-zinc-300" {...props}>{children}</code>
            </pre>
          </div>
        );
      }
      
      return (
        <code
          className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-[12.5px] text-zinc-800 dark:text-zinc-200 font-semibold"
          {...props}
        >
          {children}
        </code>
      );
    },
    ul: ({ ...props }) => <ul className="space-y-2 mb-4 list-none" {...props} />,
    li: ({ children, ...props }) => {
      const content = String(children);
      if (content.startsWith('[ ]') || content.startsWith('[x]')) {
        const isChecked = content.startsWith('[x]');
        return (
          <li className="flex items-start gap-2.5 group" {...props}>
            <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700 bg-white/5 dark:bg-zinc-800'}`}>
              {isChecked && <Check size={10} />}
            </div>
            <span className="text-[14px] text-zinc-650 dark:text-zinc-350 font-normal">
              {content.substring(3).trim()}
            </span>
          </li>
        );
      }
      return (
        <li className="flex items-start gap-2.5" {...props}>
          <div className="mt-2.5 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 flex-shrink-0" />
          <span className="text-[14px] leading-relaxed text-zinc-650 dark:text-zinc-350 font-normal">{children}</span>
        </li>
      );
    },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0d0d0d] transition-colors duration-300 relative">
      {/* Messages List Container */}
      <div
        ref={scrollRef}
        className="flex-1 h-0 overflow-y-auto scrollbar-thin scroll-smooth"
      >
        <div className="max-w-3xl w-full mx-auto p-4 md:p-8 pb-8 space-y-8 transition-all duration-500">
          {messages.map((msg, idx) => {
            if (msg.role === "user") {
              const contentStr = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2);
              const isStackTrace = contentStr.includes('\n') || contentStr.includes('\tat ') || contentStr.includes('Error:');
              
              return (
                <div key={idx} id={`msg-${idx}`} className="flex flex-col items-end w-full animate-in fade-in duration-300 scroll-mt-20">
                  <div className={`px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-[#1f1f23] border border-zinc-200 dark:border-zinc-800 text-[14px] text-zinc-800 dark:text-zinc-100 shadow-sm ${
                    isStackTrace 
                      ? 'font-mono text-[12px] overflow-x-auto whitespace-pre-wrap max-h-52 scrollbar-thin leading-relaxed w-full bg-[#18181b] dark:bg-[#121214]' 
                      : 'whitespace-pre-wrap font-sans font-normal text-left max-w-[70%]'
                  }`}>
                    {contentStr}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={idx} id={`msg-${idx}`} className="flex flex-col items-start w-full animate-in fade-in duration-500 scroll-mt-20">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-250 dark:border-zinc-800 shadow-sm shrink-0">
                      <Sparkles size={11} className="text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      Trace Expert Solution
                    </span>
                  </div>
                  <div className="w-full text-zinc-800 dark:text-zinc-200 overflow-hidden pl-1">
                    <div className="prose prose-zinc dark:prose-invert max-w-none break-words
                      prose-p:text-[14.5px] prose-p:leading-relaxed prose-p:text-zinc-650 dark:prose-p:text-zinc-350
                      prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold
                      prose-code:before:content-none prose-code:after:content-none
                      prose-li:text-[14px] prose-li:leading-relaxed
                      prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700 prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-900/30 prose-blockquote:py-1.5 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-zinc-500"
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {cleanContent(msg.content)}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 pl-1 select-none">
                    <CopyMessageButton text={cleanContent(msg.content)} />
                    <button className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors" data-tooltip="Share">
                      <Share2 size={13} />
                    </button>
                    <button 
                      onClick={() => useDebugStore.getState().retryAnalysis()}
                      className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors" 
                      data-tooltip="Regenerate"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors" data-tooltip="More options">
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </div>
              );
            }
          })}

          {/* Streaming / Thinking State */}
          {(isStreaming || streamedResponse) && (
            <div className="flex flex-col items-start w-full animate-in fade-in duration-300 pl-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" />
                </div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  {streamedResponse ? "Synthesizing Fix..." : "Thinking..."}
                </span>
              </div>
              
              <div className="w-full text-zinc-800 dark:text-zinc-200 overflow-hidden pl-1">
                {!streamedResponse ? (
                  <div className="space-y-3.5 animate-pulse max-w-lg">
                    <div className="h-3.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-3/4" />
                    <div className="h-3.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-1/2" />
                    <div className="h-3.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-5/6" />
                  </div>
                ) : (
                  <div className="prose prose-zinc dark:prose-invert max-w-none break-words
                    prose-p:text-[14.5px] prose-p:leading-relaxed prose-p:text-zinc-650 dark:prose-p:text-zinc-350
                    prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown components={markdownComponents}>
                      {cleanContent(streamedResponse)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between group/error animate-in zoom-in-95">
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

          {/* Spacer block so scrollable content isn't clipped by bottom absolute overlay bar */}
          <div className="h-32 w-full shrink-0" />
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#0d0d0d] dark:via-[#0d0d0d]/95 dark:to-transparent pt-16 z-10 pointer-events-none">
        <div className={`w-full mx-auto relative group pointer-events-auto transition-[max-width] duration-300 ease-out ${isWide ? "max-w-4xl" : "max-w-3xl"}`}>
          {/* Subtle Glow */}
          <div className="absolute inset-0 bg-zinc-900/5 dark:bg-white/5 rounded-2xl blur-xl transition-all duration-500 pointer-events-none" />



          <div className="relative flex items-end gap-2 bg-white dark:bg-[#1c1c1f] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-2 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all">
            <div className="shrink-0">
              <AttachMenu
                position="up"
                onAttachText={(text) =>
                  setFollowUp((prev) =>
                    (prev ? `${prev}\n\n${text}` : text).slice(0, MAX_INPUT_CHARS)
                  )
                }
              />
            </div>

            <textarea
              ref={followUpRef}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value.slice(0, MAX_INPUT_CHARS))}
              maxLength={MAX_INPUT_CHARS}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about the bug..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[14px] py-2 px-1.5 resize-none overflow-y-auto min-h-[40px] max-h-[200px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-450 dark:placeholder:text-zinc-600 scrollbar-thin leading-relaxed"
            />

            <button
              onClick={() => !isLimitReached && handleSend()}
              disabled={!followUp.trim() || isStreaming || isLimitReached}
              data-tooltip={isLimitReached ? "Daily limit reached — resets at 12:30 PM IST" : "Send"}
              className={`p-2 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0 border ${
                isLimitReached
                  ? "bg-rose-500/20 text-rose-500 border-rose-500/30 cursor-not-allowed shadow-none"
                  : deepMode
                    ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-transparent hover:from-amber-400 hover:to-orange-500 disabled:opacity-20"
                    : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 border-transparent disabled:opacity-20 disabled:cursor-default"
              }`}
            >
              {isLimitReached ? <RotateCcw size={14} /> : deepMode ? <Zap size={15} className="fill-white" /> : <Send size={15} />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-600 mt-2.5">
            <span>Trace can make mistakes. Verify critical fixes.</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <a
              href={MANISH_LABS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              Manish Labs <ArrowUpRight size={10} className="opacity-60" />
            </a>
            {nearLimit && (
              <span className={`font-semibold tabular-nums ${followUp.length >= MAX_INPUT_CHARS ? "text-rose-500" : "text-amber-500"}`}>
                · {followUp.length}/{MAX_INPUT_CHARS}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamResponse;
