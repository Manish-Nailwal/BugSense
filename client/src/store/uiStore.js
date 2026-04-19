import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create()(
  persist(
    (set) => ({
      isLogsOpen: false, // Default closed as requested
      logStackWidth: 38, // Default percentage
      chatMaxWidthClass: 'max-w-3xl',
      
      setLogsOpen: (isOpen) => set({ isLogsOpen: isOpen }),
      setLogStackWidth: (width) => set({ logStackWidth: width }),
      toggleLogs: () => set((state) => ({ isLogsOpen: !state.isLogsOpen })),
    }),
    {
      name: 'bugsense-ui-layout',
    }
  )
);
