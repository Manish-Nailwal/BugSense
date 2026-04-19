import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDebugStore from "../../store/debugStore";
import useAuthStore from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import {
  BookOpen,
  Plus,
  MessageSquare,
  Search,
  Folder,
  Zap,
  PanelLeftClose,
  SquarePen,
  LayoutDashboard,
  Library,
  Archive,
  Settings,
  LogOut,
  Moon,
  Sun,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  History,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle }) => {
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
  const { renameSession, deleteSession } = useDebugStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
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
    if (!raw) return "New Session...";
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

  return (
    <div
      className={`h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col text-zinc-900 dark:text-[#ececec] transition-all duration-300 border-r border-zinc-200 dark:border-zinc-800/50 ${
        isOpen ? "overflow-hidden" : "items-center overflow-visible"
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
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                  <Zap size={18} fill="white" className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                  BugSense
                </span>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-1 leading-none">
                  Expert Debugger
                </span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
              title="Close sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={onToggle}
              className="text-zinc-400 dark:text-[#9b9b9b] hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <PanelLeftClose size={18} className="rotate-180" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <Zap size={16} fill="white" className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Area */}
      <div
        className={`px-4 space-y-1.5 mb-6 flex flex-col ${isOpen ? "w-full" : "items-center"}`}
      >
        <button
          onClick={() => {
            resetSession();
            navigate("/");
          }}
          className={`group relative transition-all duration-300 flex items-center overflow-hidden ${
            isOpen
              ? `w-full h-12 px-4 justify-between rounded-2xl border ${isActiveRoute("/") ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"}`
              : `w-11 h-11 justify-center rounded-2xl ${isActiveRoute("/") ? "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`
          }`}
          title="Start New Debug Session"
        >
          <div
            className={`flex items-center ${isOpen ? "gap-3" : "justify-center"}`}
          >
            <SquarePen
              size={18}
              className={`${isActiveRoute("/") ? "text-emerald-500" : "text-zinc-500 group-hover:text-emerald-500"} transition-colors`}
            />
            {isOpen && (
              <span
                className={`text-[14px] font-bold tracking-tight ${isActiveRoute("/") ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"}`}
              >
                New Diagnosis
              </span>
            )}
          </div>
          {isOpen && (
            <div
              className={`flex items-center justify-center w-5 h-5 rounded-lg transition-colors ${isActiveRoute("/") ? "bg-emerald-500 text-white" : "bg-transparent text-zinc-500"}`}
            >
              <Plus size={12} strokeWidth={3} />
            </div>
          )}
        </button>
        


        {/* Primary Navigation */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center transition-all duration-200 ${
            isOpen
              ? `w-full h-11 px-4 gap-3 rounded-xl group ${isActiveRoute("/dashboard") ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`
              : `w-11 h-11 justify-center rounded-xl ${isActiveRoute("/dashboard") ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`
          }`}
          title="Dashboard"
        >
          <LayoutDashboard
            size={18}
            className={`${isActiveRoute("/dashboard") ? "text-emerald-500" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors`}
          />
          {isOpen && (
            <span
              className={`text-[14px] font-bold ${isActiveRoute("/dashboard") ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
            >
              Dashboard
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/library")}
          className={`flex items-center transition-all duration-200 ${
            isOpen
              ? `w-full h-11 px-4 gap-3 rounded-xl group ${isActiveRoute("/library") ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`
              : `w-11 h-11 justify-center rounded-xl ${isActiveRoute("/library") ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`
          }`}
          title="Library"
        >
          <Library
            size={18}
            className={`${isActiveRoute("/library") ? "text-emerald-500" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors`}
          />
          {isOpen && (
            <span
              className={`text-[14px] font-bold ${isActiveRoute("/library") ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
            >
              Library
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (!isOpen) return;
            if (!isSearching) {
              setIsSearching(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }
          }}
          className={`flex items-center transition-all duration-200 ${
            isOpen
              ? `w-full h-11 px-4 gap-3 rounded-xl group ${isSearching ? "bg-zinc-100 dark:bg-zinc-900 border border-emerald-500/30" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`
              : "w-11 h-11 justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl"
          }`}
          title="Search"
        >
          <Search
            size={18}
            className={`${isSearching ? "text-emerald-500" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors shrink-0`}
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
                className="bg-transparent border-none text-[13px] text-zinc-900 dark:text-white w-full focus:outline-none placeholder:text-zinc-400"
              />
            ) : (
              <span className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white w-full text-left">
                Search History
              </span>
            ))}
        </button>
      </div>

      {/* History List */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-none flex flex-col ${isOpen ? "px-4 w-full" : "px-1 items-center pt-2"}`}
      >
        {isOpen && (
          <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-950 px-3 py-4 mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-transparent">
            <History size={12} />
            Recent History
          </div>
        )}

        <div
          className={`space-y-1 w-full flex flex-col ${
            isOpen ? "" : "items-center"
          }`}
        >
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
                  className={`transition-all duration-300 group relative truncate flex items-center shrink-0 w-full ${
                    isOpen
                      ? "text-left px-4 py-3 rounded-xl"
                      : "w-11 h-11 justify-center rounded-xl mb-2"
                  } ${
                    sessionId === session._id && pathname.startsWith("/c/")
                      ? "bg-white dark:bg-zinc-900 text-emerald-500 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
                  }`}
                  title={!isOpen ? formatChatTitle(session) : undefined}
                >
                  {isOpen ? (
                    <div className="flex items-center gap-3 w-full overflow-hidden font-bold">
                      <MessageSquare
                        size={14}
                        className={
                          sessionId === session._id &&
                          pathname.startsWith("/c/")
                            ? "text-emerald-500"
                            : "text-zinc-400 group-hover/chat-item:text-emerald-500 transition-colors"
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
                          className="flex-1 bg-white dark:bg-zinc-800 border-none px-0 py-0 text-[13px] font-bold outline-none text-zinc-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-[13px] block truncate flex-1 pr-4">
                          {formatChatTitle(session)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <MessageSquare
                      size={18}
                      className={
                        sessionId === session._id && pathname.startsWith("/c/")
                          ? "text-emerald-500"
                          : "text-zinc-500 group-hover/chat-item:text-emerald-500 transition-colors"
                      }
                    />
                  )}
                </button>

                {isOpen && !editingId && (
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
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-[12px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all text-left underline decoration-emerald-500/30 underline-offset-4"
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
      </div>

      {/* Delete Confirmation Modal (Consistent terminology) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-[24px] bg-rose-500/10 flex items-center justify-center text-rose-500">
               <Trash2 size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic">Discard Diagnosis?</h3>
              <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                This diagnostic history for <span className="text-zinc-900 dark:text-zinc-200 font-bold italic">"{formatChatTitle(sessionToDelete)}"</span> will be permanently removed.
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
        className={`mt-auto w-full flex items-center p-4 border-t border-zinc-200 dark:border-zinc-900/50 relative ${
          isOpen ? "" : "justify-center"
        }`}
      >
        {isProfileMenuOpen && (
          <div
            className={`absolute bottom-full left-4 mb-4 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-4`}
          >
            <div className="px-3 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
              <p className="text-[14px] font-black text-zinc-900 dark:text-white truncate tracking-tight">{user?.displayName || "Guest User"}</p>
              <p className="text-[10px] font-medium text-zinc-500 truncate">{user?.email}</p>
            </div>
            
            <button
               onClick={() => { setIsProfileMenuOpen(false); navigate("/settings"); }}
               className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-[12px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
               <Settings size={14} /> Profile Settings
            </button>
            <button
               onClick={() => { setIsProfileMenuOpen(false); navigate("/guide"); }}
               className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-[12px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
               <BookOpen size={14} /> App Guide
            </button>
            <button
               onClick={() => { setIsProfileMenuOpen(false); navigate("/analytics/reports"); }}
               className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-[12px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
               <Archive size={14} /> My Reports
            </button>
            <button
               onClick={() => { setIsProfileMenuOpen(false); toggleTheme(); }}
               className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-[12px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
               {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
            
            <button
               onClick={() => { setIsProfileMenuOpen(false); logout(); navigate("/"); }}
               className="w-full flex items-center gap-3 px-3 py-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-rose-600 text-[12px] font-black uppercase tracking-widest"
            >
               <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsProfileMenuOpen(!isProfileMenuOpen);
          }}
          className={`flex items-center transition-all duration-300 group ${
            isOpen
              ? "w-full py-3 px-3 gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl"
              : "w-11 h-11 justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl"
          }`}
        >
          <div className="relative shrink-0">
             <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-white text-emerald-500 font-black text-sm flex items-center justify-center uppercase shadow-xl transition-transform group-hover:rotate-12">
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 shadow-sm" />
          </div>
          {isOpen && (
            <div className="flex flex-col items-start overflow-hidden text-left">
               <span className="text-[13px] font-black text-zinc-900 dark:text-zinc-100 truncate w-full tracking-tight">{user?.displayName || "Guest User"}</span>
               <span className="text-[10px] font-bold text-zinc-500 truncate w-full opacity-60">Verified Member</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
