import type { NextConfig } from "next";
import { redirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
  async redirects() { return redirects; },
  // The sitemap index lives in a route handler; serve it at the standard address.
  async rewrites() { return { beforeFiles: [{ source: "/sitemap.xml", destination: "/sitemap-index.xml" }], afterFiles: [], fallback: [] }; },
  async headers() {
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.statcounter.com https://www.googletagmanager.com${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://static.wixstatic.com https://i.ytimg.com https://images.unsplash.com https://www.macrohype.com https://macrohype.com https://my.matterport.com https://*.matterport.com https://*.public.blob.vercel-storage.com https://c.statcounter.com https://*.statcounter.com https://*.google-analytics.com https://*.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.googleapis.com https://vercel.com https://*.blob.vercel-storage.com https://*.statcounter.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://my.matterport.com https://drive.google.com",
      "media-src 'self' https://static.wixstatic.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      ],
    }];
  },
  poweredByHeader: false,
};

export default nextConfig;
