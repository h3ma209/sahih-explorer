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
