import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired ya invalid — wa_token hatao, lekin wa_user rakho
      // taake dobara login par user ki info preserve rahe
      localStorage.removeItem('wa_token');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function setToken(token: string) { localStorage.setItem('wa_token', token); }
export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('wa_token') : null; }
export function removeToken() { localStorage.removeItem('wa_token'); localStorage.removeItem('wa_user'); }
