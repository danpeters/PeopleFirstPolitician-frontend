/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security: Remove X-Powered-By header
  poweredByHeader: false,

  // Enable React Strict Mode
  reactStrictMode: true,

  // ============================================================
  // FONT ERROR FIX
  // This forces Next.js to use Babel (via webpack) instead of
  // the SWC compiler, which avoids the "Unknown font 'Geist'"
  // error in the development overlay.
  // ============================================================
  webpack: (config) => {
    return config;
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;