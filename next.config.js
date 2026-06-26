/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

module.exports = nextConfig;
