import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // CloudFront CDN for public assets (logos, team photos)
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        // S3 direct (dev fallback)
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
