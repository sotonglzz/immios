/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Disable static generation for pages that use Firebase
  output: 'standalone',
  trailingSlash: false,
};

module.exports = nextConfig; 