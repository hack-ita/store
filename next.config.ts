import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.hoplix.com',
        port: '',
        pathname: '/v1/preview/**',
      },
      {
        protocol: 'https',
        hostname: 'd29gv5mnjp8nf8.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  staticPageGenerationTimeout: 120,
};

export default nextConfig;