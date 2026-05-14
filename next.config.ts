import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "freekitchenbr.com.br" },
    ],
  },
};

export default nextConfig;
