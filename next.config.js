/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    serverActions: true
  },
  output: 'standalone',
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  }
};

module.exports = nextConfig;
