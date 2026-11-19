// Cliente HTTP para a API real (Otica_Support_Back).
// Ainda não é usado: hoje os serviços vêm de ./mock.js. Veja o README para trocar.
import axios from 'axios';
import { useAuth } from '../store/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) useAuth.getState().logout();
    return Promise.reject(err);
  },
);
