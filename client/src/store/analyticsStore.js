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
  quotaCounts: {}, // raw per-model counts from server
  quota: { current: 0, limit: 20 },
  isGeneratingReport: false,
  isFetchingHistory: false,

  fetchQuota: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/debug/quota`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Store raw per-model counts; modal reads per-selected-model quota 
      const counts = data.data;
      set({ quotaCounts: counts });
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

  generateNeuralReport: async (selectedModel, force = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isGeneratingReport: true, neuralReport: null, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/api/analytics/report`, { selectedModel, force }, {
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
      let data;
      if (forceRefresh) {
        const response = await axios.post(`${API_URL}/api/analytics/refresh`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        data = response.data;
      } else {
        const response = await axios.get(`${API_URL}/api/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        data = response.data;
      }
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
