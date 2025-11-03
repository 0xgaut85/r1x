import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['wagmi', '@reown/appkit', '@reown/appkit-adapter-wagmi'],
};

export default nextConfig;
