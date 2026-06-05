import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDebugStore from "../../store/debugStore";
import useAuthStore from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useUiStore } from "../../store/uiStore";
import {
  BookOpen,
  Plus,
  MessageSquare,
  Search,
  Folder,
  PanelLeftClose,
  SquarePen,
  LayoutDashboard,
  Library,
  Archive,
  Sparkles,
  UserCog,
  Settings,
  ChevronRight,
  Zap,
  LogOut,
  Moon,
  Sun,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  History,
  Cpu,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle, isSidebarHovered }) => {
  const {
    pastSessions,
    fetchSessions,
    loadSession,
    resetSession,
    sessionId,
    messages,
  } = useDebugStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { renameSession, deleteSession, quota, fetchQuota } = useDebugStore();
  const { openSettings, searchSignal, historyExpanded, toggleHistoryExpanded } = useUiStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  // Persisted in the UI store so it survives page changes + refreshes.
  const showHistory = historyExpanded;
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const isActiveRoute = (route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  };

  const formatChatTitle = (session) => {
    if (session?.title) return session.title;
    const raw = session?.rawError;
    if (!raw) return "New Bug...";
    const firstLine = raw.split("\n")[0];
    return firstLine
      .replace(
        /^(Uncaught\s+)?(TypeError|ReferenceError|Error|SyntaxError|EvalError|RangeError|URIError):\s*/i,
        "",
      )
      .replace(/^(\[object\s+Object\]|\{.*\})\s*/i, "Context")
      .substring(0, 35);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (
        !event.target.closest(".chat-menu-btn") &&
        !event.target.closest(".session-options-menu")
      ) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl/Cmd+K (handled globally) bumps searchSignal — open + focus the search.
  useEffect(() => {
    if (!searchSignal) return;
    if (!isOpen) onToggle();
    setIsSearching(true);
    const t = setTimeout(() => searchInputRef.current?.focus(), isOpen ? 50 : 320);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchSignal]);

  // Esc closes the sidebar's local panels (search, row menus, delete dialog).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMenuOpenId(null);
      setEditingId(null);
      setIsDeleteModalOpen(false);
      setIsSearching(false);
      setSearchQuery("");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      // When collapsed, clicking ANY empty area of the rail expands it.
      // Clicks on actual icons/buttons keep their own behaviour.
      onClick={(e) => {
        if (!isOpen && !e.target.closest("button")) onToggle();
      }}
      className={`h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col text-zinc-900 dark:text-[#ececec] transition-all duration-300 border-r border-zinc-200 dark:border-zinc-900/60 ${isOpen ? "overflow-hidden" : "items-center overflow-visible cursor-e-resize [&_button]:cursor-pointer"
        }`}
    >
      {/* Header with Branding and Toggle */}
      <div
        className={`flex items-center w-full p-4 mb-2 ${isOpen ? "justify-between" : "justify-center flex-col gap-4"}`}
      >
        {isOpen ? (
          <>
            <div
              className="flex items-center gap-2.5 px-0.5 group cursor-pointer transition-all active:scale-95"
              onClick={() => {
                resetSession();
                navigate("/");
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-900 dark:bg-white blur-md opacity-5 group-hover:opacity-15 transition-all scale-110" />
                <div className="relative w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm text-white dark:text-zinc-950">
                  <Cpu size={16} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-black tracking-[0.22em] uppercase text-zinc-950 dark:text-white leading-none">
                  Trace
                </span>
                <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
                  by Manish Labs
                </span>
              </div>
            </div>
            <div className="relative group/tooltip flex items-center">
              <button
                onClick={onToggle}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <PanelLeftClose size={18} />
              </button>
              <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 -translate-y-1 transition-all duration-150 z-[200]">
                Close sidebar
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-8 h-8 cursor-e-resize">
            {isSidebarHovered ? (
              <div className="relative group/tooltip flex items-center justify-center">
                <button
                  onClick={onToggle}
                  className="w-8 h-8 rounded-lg bg-zinc-150 dark:bg-zinc-900 border border-zinc-250/30 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white transition-all active:scale-95 shadow-sm"
                >
                  <PanelLeftClose size={18} className="rotate-180 text-zinc-650 dark:text-zinc-400" />
                </button>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 -translate-x-2 transition-all duration-150 z-[200]">
                  Open sidebar
                </div>
              </div>
            ) : (
              <div
                data-tooltip="Expand sidebar"
                data-tip-pos="right"
                className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center shadow-md text-white dark:text-zinc-950 cursor-e-resize"
              >
                <Cpu size={16} className="stroke-[2.5]" />
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`px-4 space-y-1.5 ${isOpen ? "mb-6" : "mb-1.5"} flex flex-col ${isOpen ? "w-full" : "items-center"}`}
      >
        <div className="relative group/tooltip flex items-center justify-center w-full">
          <button
            onClick={() => {
              resetSession();
              navigate("/");
            }}
            className={`group relative transition-all duration-300 flex items-center overflow-hidden ${isOpen
              ? `w-full h-12 px-4 justify-between rounded-2xl border ${isActiveRoute("/") ? "bg-zinc-150/50 dark:bg-zinc-900 border-zinc-250/30 dark:border-zinc-800" : "border-transparent hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              : `w-11 h-11 justify-center rounded-2xl ${isActiveRoute("/") ? "bg-zinc-150/50 dark:bg-zinc-900 border border-zinc-250/30 dark:border-zinc-800" : "hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              }`}
          >
            <div
              className={`flex items-center ${isOpen ? "gap-3" : "justify-center"}`}
            >
              <SquarePen
                size={18}
                className={`${isActiveRoute("/") ? "text-zinc-950 dark:text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors`}
              />
              {isOpen && (
                <span
                  className={`text-sm font-medium ${isActiveRoute("/") ? "text-zinc-950 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
                >
                  New Chat
                </span>
              )}
            </div>
            {isOpen && (
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-lg transition-colors ${isActiveRoute("/") ? "bg-zinc-955 dark:bg-white text-white dark:text-zinc-950" : "bg-transparent text-zinc-500"}`}
              >
                <Plus size={12} strokeWidth={3} />
              </div>
            )}
          </button>
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 -translate-x-2 transition-all duration-150 z-[200]">
              New Chat
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <div className="relative group/tooltip flex items-center justify-center w-full">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center transition-all duration-200 ${isOpen
              ? `w-full h-11 px-4 gap-3 rounded-xl group ${isActiveRoute("/dashboard") ? "bg-zinc-150/50 dark:bg-zinc-900/40" : "hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              : `w-11 h-11 justify-center rounded-xl ${isActiveRoute("/dashboard") ? "bg-zinc-150/50 dark:bg-zinc-900/40" : "hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              }`}
          >
            <LayoutDashboard
              size={18}
              className={`${isActiveRoute("/dashboard") ? "text-zinc-950 dark:text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors`}
            />
            {isOpen && (
              <span
                className={`text-sm font-medium ${isActiveRoute("/dashboard") ? "text-zinc-955 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
              >
                Dashboard
              </span>
            )}
          </button>
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 -translate-x-2 transition-all duration-150 z-[200]">
              Dashboard
            </div>
          )}
        </div>

        <div className="relative group/tooltip flex items-center justify-center w-full">
          <button
            onClick={() => navigate("/library")}
            className={`flex items-center transition-all duration-200 ${isOpen
              ? `w-full h-11 px-4 gap-3 rounded-xl group ${isActiveRoute("/library") ? "bg-zinc-150/50 dark:bg-zinc-900/40" : "hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              : `w-11 h-11 justify-center rounded-xl ${isActiveRoute("/library") ? "bg-zinc-150/50 dark:bg-zinc-900/40" : "hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              }`}
          >
            <Library
              size={18}
              className={`${isActiveRoute("/library") ? "text-zinc-955 dark:text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors`}
            />
            {isOpen && (
              <span
                className={`text-sm font-medium ${isActiveRoute("/library") ? "text-zinc-950 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
              >
                Library
              </span>
            )}
          </button>
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 -translate-x-2 transition-all duration-150 z-[200]">
              Library
            </div>
          )}
        </div>

        <div className="relative group/tooltip flex items-center justify-center w-full">
          <button
            onClick={() => {
              if (!isOpen) {
                onToggle();
                setIsSearching(true);
                setTimeout(() => searchInputRef.current?.focus(), 300);
              } else if (!isSearching) {
                setIsSearching(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }
            }}
            className={`flex items-center transition-all duration-205 ${isOpen
              ? `w-full h-11 px-4 gap-3 rounded-xl group ${isSearching ? "bg-zinc-150/55 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800" : "hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40"}`
              : "w-11 h-11 justify-center hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40 rounded-xl"
              }`}
          >
            <Search
              size={18}
              className={`${isSearching ? "text-zinc-955 dark:text-white" : "text-zinc-500 dark:text-zinc-450 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors shrink-0`}
            />
            {isOpen &&
              (isSearching ? (
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setIsSearching(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search history..."
                  className="bg-transparent border-none text-xs text-zinc-900 dark:text-white w-full focus:outline-none placeholder:text-zinc-400"
                />
              ) : (
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white w-full text-left">
                  Search History
                </span>
              ))}
          </button>
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 -translate-x-2 transition-all duration-150 z-[200]">
              Search
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      {isOpen && <div className="mx-4 h-px bg-zinc-200 dark:bg-zinc-900/60 my-2" />}

      {/* History List (collapsed empty area expands via the root click handler) */}
      <div
        data-tooltip={!isOpen ? "Expand sidebar" : undefined}
        data-tip-pos="right"
        className={`flex-1 overflow-y-auto scrollbar-none flex flex-col ${isOpen ? "px-4 w-full pt-1" : "px-1 items-center pt-0"}`}
      >
        {isOpen ? (
          <>
            <button
              onClick={toggleHistoryExpanded}
              className="w-full px-3 py-1.5 mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              data-tooltip={showHistory ? "Hide recent chats" : "Show recent chats"}
              data-tip-pos="right"
            >
              <History size={12} />
              <span className="flex-1 text-left">Recent History</span>
              <ChevronRight
                size={12}
                className={`transition-transform duration-200 ${showHistory ? "rotate-90" : ""}`}
              />
            </button>

            {(showHistory || searchQuery.trim()) && (
            <div className="space-y-0.5 w-full flex flex-col">
              {pastSessions
                .filter((session) =>
                  (session.title || session.rawError)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((session) => (
                  <div
                    key={session._id}
                    className={`relative group/chat-item ${menuOpenId === session._id ? "z-[60]" : "z-0"}`}
                  >
                    <button
                      onClick={() => {
                        if (editingId) return;
                        navigate(`/c/${session._id}`);
                      }}
                      className={`transition-all duration-200 group relative truncate flex items-center shrink-0 w-full text-left px-3 py-2 rounded-lg ${
                        sessionId === session._id && pathname.startsWith("/c/")
                          ? "bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm text-zinc-950 dark:text-white font-bold"
                          : "text-zinc-500 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 w-full overflow-hidden font-medium">
                        <MessageSquare
                          size={14}
                          className={
                            sessionId === session._id &&
                            pathname.startsWith("/c/")
                              ? "text-zinc-950 dark:text-white"
                              : "text-zinc-400 group-hover/chat-item:text-zinc-900 dark:group-hover/chat-item:text-white transition-colors"
                          }
                        />
                        {editingId === session._id ? (
                          <input
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                renameSession(session._id, tempTitle);
                                setEditingId(null);
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                            className="flex-1 bg-white dark:bg-zinc-800 border-none px-0 py-0 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-xs block truncate flex-1 pr-4">
                            {formatChatTitle(session)}
                          </span>
                        )}
                      </div>
                    </button>

                    {!editingId && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/chat-item:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(
                              menuOpenId === session._id ? null : session._id,
                            );
                          }}
                          className="chat-menu-btn p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all font-bold"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {menuOpenId === session._id && (
                          <div className="session-options-menu absolute top-full right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1 z-[1000]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(session._id);
                                setTempTitle(formatChatTitle(session));
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-[12px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all text-left"
                            >
                              <Pencil size={12} />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDelete(session);
                                setIsDeleteModalOpen(true);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-[12px] font-bold text-rose-500 transition-all text-left"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
            )}
          </>
        ) : null}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-[24px] bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Trash2 size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic">Delete Chat History?</h3>
              <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                The chat history for <span className="text-zinc-900 dark:text-zinc-200 font-bold italic">"{formatChatTitle(sessionToDelete)}"</span> will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-[13px] font-bold"
              >
                No, Keep it
              </button>
              <button
                onClick={() => {
                  deleteSession(sessionToDelete._id);
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 py-4 rounded-2xl bg-rose-600 text-white text-[13px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Area */}
      <div
        ref={menuRef}
        className={`mt-auto w-full flex items-center p-4 border-t border-zinc-200 dark:border-zinc-900/50 relative ${isOpen ? "" : "justify-center"
          }`}
      >
        {isProfileMenuOpen && (
          <div
            className={`absolute bottom-full mb-3 w-56 min-w-[224px] bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-2xl p-1.5 z-50 ${
              isOpen ? "left-4" : "left-2"
            }`}
          >
            {/* Header — clickable, opens Account */}
            <button
              onClick={() => { setIsProfileMenuOpen(false); openSettings("account"); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 mb-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group/header"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center shrink-0">
                <span className="text-white dark:text-zinc-950 font-black text-[11px] uppercase">{user?.displayName?.[0] || user?.email?.[0] || "U"}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate tracking-tight">{user?.displayName || "Guest User"}</p>
                <p className="text-[10px] text-zinc-500 truncate capitalize">{user?.plan || "free"}</p>
              </div>
              <ChevronRight size={14} className="text-zinc-400 group-hover/header:translate-x-0.5 transition-transform" />
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => { setIsProfileMenuOpen(false); navigate("/workspace"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Folder size={14} /> My Workspace
            </button>
            <button
              onClick={() => { setIsProfileMenuOpen(false); openSettings("personalization"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Sparkles size={14} /> Personalization
            </button>
            <button
              onClick={() => { setIsProfileMenuOpen(false); openSettings("account"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <UserCog size={14} /> Profile
            </button>
            <button
              onClick={() => { setIsProfileMenuOpen(false); openSettings("general"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Settings size={14} /> Settings
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => { setIsProfileMenuOpen(false); navigate("/guide"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <BookOpen size={14} /> App Guide
            </button>
            <button
              onClick={() => { setIsProfileMenuOpen(false); navigate("/analytics/reports"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Archive size={14} /> My Reports
            </button>
            <button
              onClick={() => { setIsProfileMenuOpen(false); toggleTheme(); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </button>

            {/* Daily usage / limits (shared pool, with a reserve held back) */}
            <div className="px-3 pt-2.5 pb-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Shared Daily Usage</span>
                <span className="text-[10px] font-semibold tabular-nums text-zinc-500">
                  {quota?.normal?.used ?? 0}/{quota?.normal?.limit ?? 500}
                </span>
              </div>
              {/* Track with a reserved zone on the right */}
              <div className="relative w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="absolute right-0 top-0 h-full bg-amber-400/30"
                  style={{ width: `${((quota?.normal?.reserve ?? 50) / (quota?.normal?.limit ?? 500)) * 100}%` }}
                  data-tooltip="Held in reserve for essentials"
                />
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(((quota?.normal?.used ?? 0) / (quota?.normal?.limit ?? 500)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                  <Zap size={11} className="text-amber-500" />
                  Deep · {quota?.deep?.remaining ?? 0}/{quota?.deep?.userLimit ?? 1} left
                </span>
                <span className="text-[9px] font-medium text-amber-500/90">{quota?.normal?.reserve ?? 50} reserved</span>
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-0.5" />

            <button
              onClick={() => { setIsProfileMenuOpen(false); logout(); navigate("/"); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-rose-600 text-xs font-medium"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}

        <div className="relative group/tooltip flex items-center justify-center w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isProfileMenuOpen) fetchQuota();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }}
            className={`flex items-center transition-all duration-300 group ${isOpen
              ? "w-full py-2.5 px-2.5 gap-3 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40 rounded-xl"
              : "w-11 h-11 justify-center hover:bg-zinc-150/40 dark:hover:bg-zinc-900/40 rounded-xl"
              }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center shadow-md transition-transform group-hover:rotate-12 border border-zinc-200/50 dark:border-transparent">
                <span className="text-white dark:text-zinc-950 font-black text-xs uppercase">
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-800 dark:bg-white border border-white dark:border-zinc-950 shadow-sm" />
            </div>
            {isOpen && (
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate w-full tracking-tight">{user?.displayName || "Guest User"}</span>
                <span className="text-[9px] font-semibold text-zinc-500 truncate w-full opacity-60">Verified Member</span>
              </div>
            )}
          </button>
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 -translate-x-2 transition-all duration-150 z-[200]">
              {user?.displayName || "Guest User"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
