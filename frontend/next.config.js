/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO and Performance
  compress: true,
  poweredByHeader: false,
  // Production optimizations
  swcMinify: true,
  // Only use standalone output in production (for Docker) - disabled for now to avoid build issues
  // Uncomment if needed for Docker deployment:
  // ...(process.env.NODE_ENV === 'production' && process.env.USE_STANDALONE === 'true' && {
  //   output: 'standalone',
  // }),
  // Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production for security
  // Disable caching in development
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  // PWA configuration
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      // IMPORTANT: Order matters! More specific routes must come first
      // Static assets - must be first to avoid interference
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment 
              ? 'no-store, no-cache, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes - never cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Images - cache in production
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment
              ? 'no-store, no-cache, must-revalidate'
              : 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        // HTML pages and other routes - no cache in development, cache in production
        // This should be last to avoid catching static files
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=()',
          },
          // Prevent caching of HTML pages in development
          ...(isDevelopment ? [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ] : []),
        ],
      },
    ];
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image caching in development
    ...(process.env.NODE_ENV === 'development' && {
      minimumCacheTTL: 0,
    }),
  },
  // Webpack configuration for CSS handling
  webpack: (config, { isServer }) => {
    // Ensure CSS is handled correctly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
