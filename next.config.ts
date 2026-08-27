import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs', '@clerk/ui'],
  },
};

export default nextConfig;
