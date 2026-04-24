import axios from 'axios';

function getBaseURL() {
  if (typeof window !== 'undefined') {
    // Vercel par: NEXT_PUBLIC_API_URL set hoga (HF Space URL)
    // Local Docker par: empty = Next.js proxy use hoga
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  // Server-side (SSR): internal Docker URL
  return process.env.INTERNAL_API_URL || 'http://api:8000';
}

const api = axios.create({ baseURL: getBaseURL() });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 aaye to auto logout + login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token invalid — saaf karo aur login par bhejo
      localStorage.removeItem('wa_token');
      localStorage.removeItem('wa_user');
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
