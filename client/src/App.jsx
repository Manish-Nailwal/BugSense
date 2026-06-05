import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useThemeStore } from "./store/themeStore";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";

import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import HomePage from "./features/debugger/HomePage";
import ChatPage from "./features/debugger/ChatPage";
import DashboardPage from "./features/analytics/DashboardPage";
import NeuralHistoryPage from "./features/analytics/NeuralHistoryPage";
import LearningArchivePage from "./features/analytics/LearningArchivePage";
import LibraryPage from "./features/library/LibraryPage";
import ArticlePage from "./features/library/ArticlePage";
import GuidePage from "./features/dashboard/GuidePage";
import WorkspacePage from "./features/workspace/WorkspacePage";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AuthLayout from "./components/layout/AuthLayout";
import AccountModals from "./features/account/AccountModals";
import RouteMeta from "./components/seo/RouteMeta";
import TooltipLayer from "./components/ui/TooltipLayer";
import { applyAccent } from "./features/account/SettingsModal";

import useAuthStore from "./store/authStore";
import { useUiStore } from "./store/uiStore";

function App() {
  const { theme } = useThemeStore();
  const { token, user, fetchMe } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Sync theme with HTML class. The theme store is persisted locally
    // (bugsense-theme), so it's the single source of truth across refreshes.
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Hydrate the full profile (personalization/preferences) once on load.
  useEffect(() => {
    if (token) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply the user's saved accent color.
  useEffect(() => {
    applyAccent(user?.preferences?.accent || "emerald");
  }, [user?.preferences?.accent]);

  // Global keyboard shortcuts (must beat the browser's defaults).
  useEffect(() => {
    const onKeyDown = (e) => {
      const ui = useUiStore.getState();
      // Ctrl/Cmd+K → open OUR search (only when signed in / sidebar exists).
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === "k" || e.key === "K")) {
        if (useAuthStore.getState().token) {
          e.preventDefault();
          ui.triggerSearch();
        }
        return;
      }
      // Esc → close the Control Center modal if it's open.
      if (e.key === "Escape" && ui.activeModal) {
        ui.closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Navbar visibility logic: Show only on public pages and the library.
  // Hide on auth-only pages like Debugger and Dashboard where Sidebar is present.
  const isLibraryPage = location.pathname.startsWith("/library");
  const isAuthPage = location.pathname.startsWith("/auth");
  const isGuidePage = location.pathname === "/guide";
  const isStaticPage = ["/about", "/terms", "/privacy"].includes(location.pathname);
  const isLandingPage = location.pathname === "/" && !token;

  const showNavbar = isLandingPage || isLibraryPage || isAuthPage || isGuidePage || isStaticPage;

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      {/* Route-driven <title> + meta (per-page; never "sticks" between pages) */}
      <RouteMeta />
      {showNavbar && <Navbar />}
      <div className={`flex-1 ${showNavbar ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <AuthLayout>
                  <HomePage />
                </AuthLayout>
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/c/:sessionId"
            element={
              token ? (
                <AuthLayout>
                  <ChatPage />
                </AuthLayout>
              ) : (
                <LandingPage />
              )
            }
          />

          <Route
            path="/guide"
            element={<GuidePage />}
          />

          <Route path="/auth">
            <Route
              path="login"
              element={!token ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="register"
              element={!token ? <RegisterPage /> : <Navigate to="/" />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analytics/reports" element={<NeuralHistoryPage />} />
              <Route path="/analytics/learning" element={<LearningArchivePage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
            </Route>
          </Route>

          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:slug" element={<ArticlePage />} />

          {/* Public static pages (accessible signed-in or not, like Library/Guide) */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global profile / personalization modals (reachable from any page) */}
      <AccountModals />

      {/* App-wide custom tooltip (driven by data-tooltip attributes) */}
      <TooltipLayer />
    </div>
  );
}

export default App;
