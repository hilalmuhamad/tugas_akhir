import { create } from 'zustand';
import api from '../../../services/api';

const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

export const useAuthStore = create((set) => ({
  user: storedUser,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      return { ok: true };
    } catch (error) {
      const message = error.response?.data?.errors?.email?.[0]
        || error.response?.data?.message
        || 'Gagal masuk. Coba lagi.';
      set({ loading: false, error: message });
      return { ok: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // abaikan error, tetap logout di sisi client
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
