import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create()(
  persist(
    (set) => ({
      isLogsOpen: false, // Default closed as requested
      logStackWidth: 38, // Default percentage
      chatMaxWidthClass: 'max-w-3xl',
      isSidebarOpen: true,
      // Whether the sidebar's "Recent History" list is expanded (persisted so it
      // keeps its state across page changes and refreshes).
      historyExpanded: true,

      // Unified Settings ("Control Center") modal: activeModal === 'settings'.
      // modalTab selects the tab (general | personalization | account | ...).
      activeModal: null,
      modalTab: 'general',

      // Bumped to request the sidebar open + focus its search (e.g. via Ctrl/Cmd+K).
      searchSignal: 0,

      setLogsOpen: (isOpen) => set({ isLogsOpen: isOpen }),
      setLogStackWidth: (width) => set({ logStackWidth: width }),
      toggleLogs: () => set((state) => ({ isLogsOpen: !state.isLogsOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setHistoryExpanded: (open) => set({ historyExpanded: open }),
      toggleHistoryExpanded: () => set((state) => ({ historyExpanded: !state.historyExpanded })),
      openModal: (modal) => set({ activeModal: modal }),
      // Open the Control Center on a specific tab.
      openSettings: (tab = 'general') => set({ activeModal: 'settings', modalTab: tab }),
      closeModal: () => set({ activeModal: null }),
      triggerSearch: () => set((state) => ({ searchSignal: state.searchSignal + 1 })),
    }),
    {
      name: 'bugsense-ui-layout',
      // Only persist layout prefs — never the transient modal state.
      partialize: (state) => ({
        isLogsOpen: state.isLogsOpen,
        logStackWidth: state.logStackWidth,
        chatMaxWidthClass: state.chatMaxWidthClass,
        isSidebarOpen: state.isSidebarOpen,
        historyExpanded: state.historyExpanded,
      }),
    }
  )
);
