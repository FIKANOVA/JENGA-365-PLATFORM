import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://challenges.cloudflare.com *.stripe.com *.mapbox.com *.paystack.com js.paystack.co *.sanity.io *.sanity-cdn.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com *.sanity.io *.sanity-cdn.com",
              "font-src 'self' data: fonts.gstatic.com *.sanity.io *.sanity-cdn.com",
              // img-src: all image hosts used across the platform
              "img-src 'self' data: blob: *.sanity.io *.r2.cloudflarestorage.com *.cloudfront.net *.mapbox.com images.unsplash.com jenga365.com *.jenga365.com lh3.googleusercontent.com api.qrserver.com *.stripe.com https://challenges.cloudflare.com",
              // connect-src: APIs + Sanity Studio realtime + Vercel preview URLs
              `connect-src 'self' ${process.env.NEXT_PUBLIC_APP_URL ?? ''} *.vercel.app *.stripe.com *.mapbox.com api.anthropic.com *.sanity.io *.sanity-cdn.com *.apicdn.sanity.io wss://*.sanity.io *.neon.tech *.paystack.com wss://*.paystack.com https://challenges.cloudflare.com`,
              // frame-src: payment iframes, Google Maps, Sanity auth + preview iframes, Looker Studio embeds, video embeds
              "frame-src 'self' https://challenges.cloudflare.com *.stripe.com *.paystack.com maps.google.com *.google.com *.sanity.io lookerstudio.google.com *.youtube.com youtube.com *.youtube-nocookie.com player.vimeo.com",
              // Sanity Studio bootstraps web workers from blob URLs
              "worker-src 'self' blob:",
              "child-src 'self' blob: https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self' *.sanity.io",
            ].join('; '),
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
