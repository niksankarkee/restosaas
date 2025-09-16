/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  reactStrictMode: true,
  // Suppress hydration warnings for browser extensions like Grammarly
  experimental: {
    suppressHydrationWarning: true,
  },
};
export default nextConfig;
