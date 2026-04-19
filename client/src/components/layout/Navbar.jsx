import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import ThemeToggle from "../ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, LayoutDashboard, SquarePen, Library, LogOut, ChevronDown, User, Settings as SettingsIcon, BookOpen } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Library", path: "/library", icon: Library },
    { name: "Guide", path: "/guide", icon: BookOpen },
    ...(user ? [
      { name: "Debug", path: "/", icon: SquarePen },
      { name: "Analytics", path: "/dashboard", icon: LayoutDashboard }
    ] : [])
  ];

  const isActiveRoute = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] px-6 pt-6 pointer-events-none">
      <nav className="max-w-7xl mx-auto h-16 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl px-6 flex items-center justify-between shadow-2xl shadow-black/5 pointer-events-auto transition-all">
        <div className="flex items-center gap-8">
          {/* Stunning Logo */}
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
             <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 group-hover:opacity-50 transition-all scale-110" />
                <div className="relative w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-xl transform group-hover:-rotate-3 transition-all duration-500">
                  <Zap size={20} className="text-white dark:text-zinc-900 fill-current" />
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[16px] font-black tracking-tighter text-zinc-900 dark:text-white leading-none uppercase italic">BugSense</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1 leading-none">Expert Debugger</span>
             </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActiveRoute(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all group ${
                    active 
                      ? "text-zinc-900 dark:text-white" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon size={14} className={`${active ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-400"} transition-colors`} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{link.name}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/80 -z-10 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {user ? (
            <div className="relative" ref={menuRef}>
               <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 focus:outline-none group"
               >
                 <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden transition-all group-hover:ring-4 group-hover:ring-emerald-500/10 active:scale-95">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[12px] font-black">
                      {user.displayName?.[0] || 'U'}
                    </div>
                 </div>
                 <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
                 {isProfileMenuOpen && (
                   <motion.div
                    initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                    className="absolute right-0 top-[calc(100%+12px)] w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 ring-1 ring-black/5"
                   >
                     <div className="px-3 py-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-1">
                        <p className="text-[13px] font-black text-zinc-900 dark:text-white truncate uppercase italic">{user.displayName || "Developer"}</p>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
                     </div>
                     <div className="space-y-0.5">
                        <button 
                          onClick={() => { setIsProfileMenuOpen(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group"
                        >
                          <SettingsIcon size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                          <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white uppercase tracking-widest">Settings</span>
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-all group"
                        >
                          <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Link to="/auth/login" className="text-[11px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-[0.15em] transition-colors pr-1">Log In</Link>
               <Link to="/auth/register" className="h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-black/10">
                 Join Now
               </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

