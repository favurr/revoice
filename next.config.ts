import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  output: "standalone",
  /* config options here */
  // experimental options here (no 'turbo' property)
  webpack: (config) => {
    config.externals.push({ 'better-sqlite3': 'commonjs better-sqlite3' });
    return config;
  },
};

export default nextConfig;
