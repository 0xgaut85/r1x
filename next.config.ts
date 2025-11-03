import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['wagmi', '@reown/appkit', '@reown/appkit-adapter-wagmi'],
  output: 'standalone',
};

export default nextConfig;
