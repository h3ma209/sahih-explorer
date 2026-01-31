import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingExcludes: {
    '*': [
      './public/data/scholars/**/*',
      'public/data/scholars/**/*',
    ],
  },
};

export default withNextIntl(nextConfig);
