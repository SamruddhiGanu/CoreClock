import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (email: string, password: string, fullName: string) =>
    api.post('/auth/register', { email, password, fullName }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const caloriesAPI = {
  getAll: (startDate?: string, endDate?: string) =>
    api.get('/calories', { params: { startDate, endDate } }),
  
  create: (data: any) =>
    api.post('/calories', data),
  
  delete: (id: string) =>
    api.delete(`/calories/${id}`),
};

export const workoutsAPI = {
  getAll: () =>
    api.get('/workouts'),
  
  create: (data: any) =>
    api.post('/workouts', data),
  
  delete: (id: string) =>
    api.delete(`/workouts/${id}`),
};

export const calendarAPI = {
  getAll: () =>
    api.get('/calendar'),
  
  create: (data: any) =>
    api.post('/calendar', data),
};

export const chatbotAPI = {
  sendMessage: (message: string) =>
    api.post('/chatbot/message', { message }),
};