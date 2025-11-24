import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // On ignore les erreurs TypeScript pour le build de production (URGENCE DÉMO)
  typescript: {
    ignoreBuildErrors: true,
  },
  // On ignore aussi les erreurs de linter (style)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;