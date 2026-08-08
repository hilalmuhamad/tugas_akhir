import { create } from 'zustand';
import {
  analyzeProfile,
  getAnalysis,
  getHistory,
  sendChatMessage,
} from '../services/careerApi';

export const useCareerStore = create((set, get) => ({
  analysis: null,
  analysisId: null,
  messages: [],
  lowongan: [],
  history: [],
  analyzing: false,
  sending: false,
  error: null,

  analyze: async (payload) => {
    set({ analyzing: true, error: null });
    try {
      const { data } = await analyzeProfile(payload);
      set({
        analyzing: false,
        analysisId: data.analysis.id,
        analysis: data.analysis.analysis,
      });
      return { ok: true, id: data.analysis.id };
    } catch (error) {
      set({
        analyzing: false,
        error: error.response?.data?.message || 'Analisis gagal. Coba lagi.',
      });
      return { ok: false };
    }
  },

  loadAnalysis: async (id) => {
    set({ error: null });
    try {
      const { data } = await getAnalysis(id);
      set({
        analysisId: data.id,
        analysis: data.analysis,
        messages: data.messages,
        lowongan: data.lowongan || [],
      });
      return { ok: true };
    } catch {
      set({ error: 'Gagal memuat analisis.' });
      return { ok: false };
    }
  },

  send: async (message) => {
    const { analysisId, messages } = get();
    set({ sending: true, error: null });
    const optimistic = [...messages, { id: `temp-${Date.now()}`, role: 'user', content: message }];
    set({ messages: optimistic });
    try {
      const { data } = await sendChatMessage(analysisId, message);
      set({
        sending: false,
        messages: [...messages, ...data.messages],
        lowongan: data.lowongan || [],
      });
      return { ok: true };
    } catch (error) {
      set({
        sending: false,
        error: error.response?.data?.message || 'Gagal mengirim pesan. Coba lagi.',
      });
      return { ok: false };
    }
  },
  loadHistory: async () => {
    try {
      const { data } = await getHistory();
      set({ history: data });
    } catch {
      // abaikan
    }
  },

  reset: () =>
    set({ analysis: null, analysisId: null, messages: [], lowongan: [], error: null }),
}));
