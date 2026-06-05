import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  const handleToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme(); // local store is the runtime source of truth (wins on refresh)
    // Keep the account preference linked (best-effort, only when signed in).
    if (useAuthStore.getState().token) {
      useAuthStore.getState().updateProfile({ preferences: { theme: next } }).catch(() => {});
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus:outline-none"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={18} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={18} strokeWidth={2.5} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export default ThemeToggle;
