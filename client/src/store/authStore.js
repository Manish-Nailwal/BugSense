import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      set({ user: data.data, token: data.data.token, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (displayName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, { 
        displayName, 
        email, 
        password 
      });
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      set({ user: data.data, token: data.data.token, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Keep the locally stored token alongside the fresh profile data.
      const merged = { ...data.data, token };
      localStorage.setItem('user', JSON.stringify(merged));
      set({ user: merged });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      }
    }
  },

  // Update profile / personalization / preferences (and optionally password).
  updateProfile: async (payload) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/api/auth/me`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const merged = { ...data.data, token };
    localStorage.setItem('user', JSON.stringify(merged));
    set({ user: merged });
    return merged;
  }
}));

export default useAuthStore;
