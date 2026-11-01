import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root (a stray package-lock.json in the user folder confuses detection)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
