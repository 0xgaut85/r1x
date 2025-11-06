import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    'wagmi', 
    '@reown/appkit', 
    '@reown/appkit-adapter-wagmi',
    '@reown/appkit-polyfills',
    '@reown/appkit-wallet',
    '@reown/appkit-common',
    '@reown/appkit-controllers',
    '@reown/appkit-utils',
  ],
  output: 'standalone',
  
  // Exclude x402-server from Next.js build (it's a separate Express server)
  typescript: {
    ignoreBuildErrors: false,
  },
  
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
  
  // Disable static generation for pages that use client-side context
  // Pages with 'use client' and WalletProvider will be rendered dynamically
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
