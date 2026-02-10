import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 500 * 1024 * 1024, // 500MB to accommodate database
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/scholars\.db$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'sqlite-database',
          expiration: {
            maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
          },
        },
      },
    ],
    additionalManifestEntries: [
      { url: '/scholars.db', revision: null },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingExcludes: {
    '*': [
      './public/data/scholars/**/*',
      'public/data/scholars/**/*',
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));
