import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable static optimization for pages that use wagmi hooks
    serverComponentsExternalPackages: ['wagmi', '@reown/appkit', '@reown/appkit-adapter-wagmi'],
  },
};

export default nextConfig;
