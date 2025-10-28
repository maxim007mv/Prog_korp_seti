/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    // Включаем оптимизации
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Переменные окружения
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api',
  },
  // Настройка изображений для внешних источников
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
}

module.exports = nextConfig
