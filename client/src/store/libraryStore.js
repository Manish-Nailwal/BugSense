import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useLibraryStore = create((set) => ({
  articles: [],
  myArticles: [],
  currentArticle: null,
  tags: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1
  },

  fetchArticles: async (page = 1, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { q, tag, authorId } = filters;
      let url = `${API_URL}/api/library?page=${page}`;
      if (q) url += `&q=${q}`;
      if (tag) url += `&tag=${tag}`;
      if (authorId) url += `&authorId=${authorId}`;

      const { data } = await axios.get(url);
      set({ 
        articles: data.data.articles, 
        pagination: {
          currentPage: data.data.currentPage,
          totalPages: data.data.totalPages
        },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch library articles', 
        isLoading: false 
      });
    }
  },

  fetchMyArticles: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/api/library?authorId=${userId}&limit=50`);
      set({ myArticles: data.data.articles, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch your articles', isLoading: false });
    }
  },

  fetchArticle: async (slug) => {
    set({ isLoading: true, error: null, currentArticle: null });
    try {
      const { data } = await axios.get(`${API_URL}/api/library/${slug}`);
      set({ currentArticle: data.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch article', 
        isLoading: false 
      });
    }
  },

  fetchTags: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/library/tags`);
      set({ tags: data.data });
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  }
}));

export default useLibraryStore;
