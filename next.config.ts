import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",      // Static HTML export — required for Firebase Hosting
  trailingSlash: true,   // Firebase Hosting prefers trailing slashes
  images: {
    unoptimized: true,   // Next Image optimisation needs a server; static export uses raw imgs
  },
};

export default nextConfig;
