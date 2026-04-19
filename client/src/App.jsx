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
import LibraryPage from "./features/library/LibraryPage";
import ArticlePage from "./features/library/ArticlePage";
import GuidePage from "./features/dashboard/GuidePage";
import SettingsPage from "./features/settings/SettingsPage";
import AuthLayout from "./components/layout/AuthLayout";

import useAuthStore from "./store/authStore";

function App() {
  const { theme } = useThemeStore();
  const { token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Sync theme with HTML class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Navbar visibility logic: Show only on public pages and the library.
  // Hide on auth-only pages like Debugger and Dashboard where Sidebar is present.
  const isLibraryPage = location.pathname.startsWith("/library");
  const isAuthPage = location.pathname.startsWith("/auth");
  const isGuidePage = location.pathname === "/guide";
  const isLandingPage = location.pathname === "/" && !token;

  const showNavbar = isLandingPage || isLibraryPage || isAuthPage || isGuidePage;

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      {showNavbar && <Navbar />}
      <div className="flex-1 h-full overflow-hidden">
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
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:slug" element={<ArticlePage />} />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
