/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@restosaas/types',
    '@restosaas/api-client',
    '@restosaas/ui',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
