import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['wagmi', '@reown/appkit', '@reown/appkit-adapter-wagmi'],
  output: 'standalone',
  
  // Build optimizations
  swcMinify: true,
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
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
};

export default nextConfig;
