// Vercel par: NEXT_PUBLIC_API_URL aur NEXT_PUBLIC_WA_URL env vars set karo
// Local Docker par: empty = Next.js proxy use hoga
export const API_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.INTERNAL_API_URL || 'http://api:8000');

export const WA_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WA_URL || '')
  : 'http://wa-service:3001';
