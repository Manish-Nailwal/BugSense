import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useAnalyticsStore = create((set, get) => ({
  summary: null,
  history: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1
  },
  neuralReport: null,
  neuralHistory: [],
  learningArchive: null,
  isFetchingArchive: false,
  // Standard daily pool usage (model is chosen server-side now).
  normalQuota: { used: 0, limit: 500, usable: 450, reserve: 50, available: true },
  isGeneratingReport: false,
  isFetchingHistory: false,

  fetchQuota: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/debug/quota`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.data?.normal) set({ normalQuota: data.data.normal });
    } catch (error) {
      console.error('Quota fetch error:', error);
    }
  },

  fetchNeuralHistory: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isFetchingHistory: true });
    try {
      const { data } = await axios.get(`${API_URL}/api/analytics/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ neuralHistory: data.data, isFetchingHistory: false });
    } catch (error) {
      set({ isFetchingHistory: false });
    }
  },

  // Read-only archive of every unique recommended skill + learning path.
  fetchLearningArchive: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isFetchingArchive: true });
    try {
      const { data } = await axios.get(`${API_URL}/api/analytics/learning`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ learningArchive: data.data, isFetchingArchive: false });
    } catch (error) {
      set({ isFetchingArchive: false });
    }
  },

  generateNeuralReport: async (force = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isGeneratingReport: true, neuralReport: null, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/api/analytics/report`, { force }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newReportObj = data.data;
      set({ 
        neuralReport: newReportObj.content, 
        isGeneratingReport: false 
      });
      // Refresh history to get the properly formatted object with ID and timestamps
      get().fetchNeuralHistory();
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to generate neural report', 
        isGeneratingReport: false 
      });
      throw error;
    }
  },

  fetchSummary: async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      if (forceRefresh) {
        // Recompute = ONLY the stat cards + Error Types chart. Merge the fresh
        // computed stats into the existing summary and PRESERVE the AI-driven
        // sections (recommended skills, learning paths, report) so they don't
        // clear or flicker.
        const response = await axios.post(`${API_URL}/api/analytics/refresh`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const stats = response.data.data;
        set((state) => ({
          summary: state.summary
            ? {
                ...state.summary,
                totalSessions: stats.totalSessions,
                totalQueries: stats.totalQueries,
                confirmedFixes: stats.confirmedFixes,
                efficiency: stats.efficiency,
                topCategory: stats.topCategory,
                queryLimit: stats.queryLimit,
                categoryStats: stats.categoryStats,
                weeklyTrend: stats.weeklyTrend,
                skillGapAlerts: stats.skillGapAlerts,
                lastManualUpdate: stats.lastManualUpdate,
              }
            : stats,
          isLoading: false,
        }));
        return;
      }

      const response = await axios.get(`${API_URL}/api/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      set({
        summary: data.data,
        neuralReport: data.data.neuralReport?.content || null,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch analytics summary', 
        isLoading: false 
      });
      if (forceRefresh) {
        alert(error.response?.data?.message || 'Failed to refresh analytics');
      }
    }
  },

  fetchHistory: async (page = 1, filters = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const { category, q } = filters;
      let url = `${API_URL}/api/analytics/sessions?page=${page}`;
      if (category) url += `&category=${category}`;
      if (q) url += `&q=${q}`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ 
        history: data.data.sessions, 
        pagination: {
          currentPage: data.data.currentPage,
          totalPages: data.data.totalPages
        },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch session history', 
        isLoading: false 
      });
    }
  }
}));

export default useAnalyticsStore;
