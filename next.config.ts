import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  transpilePackages: ["@whereby.com/browser-sdk"],
};

export default nextConfig;
