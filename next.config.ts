import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com", pathname: "/product-images/**" },
      { protocol: "https", hostname: "fakestoreapi.com", pathname: "/img/**" },
    ],
  },
};

export default nextConfig;
