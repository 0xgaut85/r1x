import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['wagmi', '@reown/appkit', '@reown/appkit-adapter-wagmi'],
  output: 'standalone',
  
  // Build optimizations
  compress: true,
  
  // Optimize build performance
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production (faster builds)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    // Turbopack optimizations are handled automatically
  },
};

export default nextConfig;
