import api from '../../../services/api';

export const fetchJobs = () => api.get('/jobs');

export const fetchRegions = () => api.get('/jobs/regions');

export const searchJobs = (query, extra = {}) =>
  api.post('/jobs/search', { query, ...extra });
