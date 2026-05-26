import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ama/shared'],
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/courses',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
