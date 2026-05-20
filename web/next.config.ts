import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
