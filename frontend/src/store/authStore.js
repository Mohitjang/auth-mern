// global state management for us
import { create } from "zustand";
import axios from "axios";

// create hook
// this fucntion take the setter as an argument
// and return the state and the setter

const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true; // to send cookies to the server

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  // signup function
  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.error || "Error Signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  // verify email function
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response.data.message || "Error Verifying Email",
        isLoading: false,
      });
      throw error;
    }
  },

  // check auth function



}));
