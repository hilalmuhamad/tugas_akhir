import api from '../../../services/api';

export const analyzeProfile = (payload) =>
  api.post('/career/analyze', payload);

export const sendChatMessage = (analysisId, message) =>
  api.post(`/career/${analysisId}/chat`, { message });

export const getAnalysis = (analysisId) =>
  api.get(`/career/${analysisId}`);

export const getHistory = () =>
  api.get('/career/history');
