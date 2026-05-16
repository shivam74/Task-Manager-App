import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Works because we will proxy or via docker
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
