import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: 'jenga365.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.mapbox.com *.paystack.com js.paystack.co",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              // img-src: all image hosts used across the platform
              "img-src 'self' data: blob: *.sanity.io *.r2.cloudflarestorage.com *.cloudfront.net *.mapbox.com images.unsplash.com jenga365.com *.jenga365.com lh3.googleusercontent.com api.qrserver.com *.stripe.com",
              // connect-src: APIs and real-time services (include Vercel preview URLs for auth)
              `connect-src 'self' ${process.env.NEXT_PUBLIC_APP_URL ?? ''} *.vercel.app *.stripe.com *.mapbox.com api.anthropic.com *.sanity.io *.neon.tech *.paystack.com wss://*.paystack.com`,
              // frame-src: payment iframes + Google Maps
              "frame-src *.stripe.com *.paystack.com maps.google.com *.google.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
