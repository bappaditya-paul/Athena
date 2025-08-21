import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
});

// Auth functions
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login/', {email, password});
  return response.data;
};

export const register = async (email: string, password: string, name: string) => {
  const response = await api.post('/auth/register/', {email, password, name});
  return response.data;
};

// Analysis functions
export const analyzeContent = async (content: string) => {
  const response = await api.post('/analyze/', {content});
  return response.data;
};

export const getAnalysisHistory = async () => {
  const response = await api.get('/analyses/');
  return response.data;
};

export const getAnalysisById = async (id: string) => {
  const response = await api.get(`/analyses/${id}/`);
  return response.data;
};

// Education functions
export const getEducationalContent = async () => {
  const response = await api.get('/education/');
  return response.data;
};

// Feedback
export const submitFeedback = async (analysisId: string, isCorrect: boolean) => {
  const response = await api.post('/feedback/', {
    analysis_id: analysisId,
    is_correct: isCorrect,
  });
  return response.data;
};
