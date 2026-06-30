import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['fsevents', '@babel/preset-typescript', 'webpack', 'next-pwa', 'workbox-webpack-plugin', 'rollup']
};

let config = nextConfig;

// We dynamically require next-pwa so that OpenNext's esbuild bundler does not trace its dependencies
// into the Cloudflare Worker bundle.
try {
  const req = require;
  const withPWA = req('next' + '-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  });
  config = withPWA(nextConfig);
} catch (e) {}

export default config;
