import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import ThemeToggle from "../ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, SquarePen, Library, LogOut, ChevronDown, Folder, Sparkles, UserCog, Settings as SettingsIcon, BookOpen, Cpu, ArrowUpRight, Info } from "lucide-react";
import { MANISH_LABS_URL } from "../../config/links";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { openSettings } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      const scrollTop = target === document || target === window
        ? (window.pageYOffset || document.documentElement.scrollTop)
        : (target.scrollTop || 0);
      setScrolled(scrollTop > 20);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

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
    { name: "About", path: "/about", icon: Info },
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled
          ? "bg-white/85 dark:bg-[#05050a]/85 backdrop-blur-md border-zinc-200/50 dark:border-zinc-900/60 py-3"
          : "bg-transparent border-transparent py-5"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 group-hover:scale-105 group-hover:rotate-45 transition-all duration-500 shadow-md">
              <Cpu size={16} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-zinc-950 dark:text-white transition-colors leading-none">
                Trace
              </span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">by Manish Labs</span>
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
                  className={`relative px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all group ${active
                      ? "text-zinc-950 dark:text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                    }`}
                >
                  <Icon size={14} className={`${active ? "text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-650 group-hover:text-zinc-900 dark:group-hover:text-white"} transition-colors`} />
                  <span className="text-sm font-medium transition-colors">{link.name}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-150/40 dark:bg-zinc-900/30 border border-zinc-200/20 dark:border-zinc-800/10 -z-10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cross-promo to the parent ecosystem hub */}
          <a
            href={MANISH_LABS_URL}
            target="_blank"
            rel="noreferrer"
            className="group hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            Manish Labs
            <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>

          <div className="hidden md:block h-4 w-px bg-zinc-200/55 dark:bg-zinc-800/55" />

          <ThemeToggle />

          <div className="h-4 w-px bg-zinc-200/55 dark:bg-zinc-800/55" />

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 focus:outline-none group"
              >
                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden transition-all group-hover:ring-4 group-hover:ring-zinc-500/5 active:scale-95">
                  <div className="w-full h-full bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 text-[11px] font-black uppercase">
                    {user.displayName?.[0] || 'U'}
                  </div>
                </div>
                <ChevronDown size={12} className="text-zinc-400 transition-transform duration-300" />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    className="absolute right-0 top-[calc(100%+12px)] w-52 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-xl p-1.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900/50 mb-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate uppercase tracking-wider">{user.displayName || "Developer"}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); navigate('/workspace'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-all group text-left"
                      >
                        <Folder size={14} className="text-zinc-450 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white">My Workspace</span>
                      </button>
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); openSettings('personalization'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-all group text-left"
                      >
                        <Sparkles size={14} className="text-zinc-450 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white">Personalization</span>
                      </button>
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); openSettings('account'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-all group text-left"
                      >
                        <UserCog size={14} className="text-zinc-450 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white">Profile</span>
                      </button>
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); openSettings('general'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-all group text-left"
                      >
                        <SettingsIcon size={14} className="text-zinc-450 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white">Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-all group text-left"
                      >
                        <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-medium">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Log In</Link>
              <Link to="/auth/register" className="flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 active:scale-[0.98] transition-all">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
