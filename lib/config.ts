// Build time mein embed hota hai — Vercel par env vars zaroor set karo
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const WA_URL  = process.env.NEXT_PUBLIC_WA_URL  || process.env.NEXT_PUBLIC_API_URL || '';