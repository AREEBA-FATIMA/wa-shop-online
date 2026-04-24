/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Vercel par proxy nahi — NEXT_PUBLIC_API_URL seedha use hoga
    // Local Docker par proxy karo
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }
    const apiUrl = process.env.INTERNAL_API_URL || 'http://api:8000';
    const waUrl  = process.env.INTERNAL_WA_URL  || 'http://wa-service:3001';
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
      { source: '/wa/:path*',  destination: `${waUrl}/wa/:path*`  },
    ];
  },
};

module.exports = nextConfig;
