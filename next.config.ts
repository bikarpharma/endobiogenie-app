import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: Force Next.js to use the correct project root
  // This fixes the issue where Next.js looks for .env.local in the wrong directory
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;