/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  // Включаем сжатие
  compress: true,
  experimental: {
    // Включаем оптимизации пакетов
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', '@tanstack/react-query'],
    // Оптимизация шрифтов
    optimizeCss: true,
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
      {
        protocol: 'https',
        hostname: 'imghost.fun',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Оптимизация компиляции
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Кеширование
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
