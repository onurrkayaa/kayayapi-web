import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Turnstile, Cloudflare Web Analytics ve Google Analytics disinda tum dis kaynaklar kapali.
 * Gelistirmede Next'in HMR websocket'i ve derleyicisi icin iki istisna eklenir.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com https://www.googletagmanager.com https://www.google-analytics.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: http://localhost:3000" : ""} https://challenges.cloudflare.com https://cloudflareinsights.com https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com`,
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          // Tarayicidan ek cihaz ayrintilari istenir (Android'de kesin model,
          // Windows 10/11 ayrimi, islemci mimarisi). Ziyaretciye hicbir sey
          // sorulmaz; basliklar bir sonraki istekten itibaren gelir.
          {
            key: "Accept-CH",
            value:
              "Sec-CH-UA-Model, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
