import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generar output standalone para Docker
  output: 'standalone',

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.sicora.edu.co',
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // Rewrites para API (opcional si se usa proxy)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
    const aiUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8010';

    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        // Proxy a API Gateway
        {
          source: '/api/v1/:path*',
          destination: `${apiUrl}/api/v1/:path*`,
        },
        // Proxy a AI Service
        {
          source: '/api/ai/:path*',
          destination: `${aiUrl}/api/ai/:path*`,
        },
      ],
    };
  },

  // Experimental features
  experimental: {
    // Optimizar imports de paquetes grandes
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // TypeScript strict
  typescript: {
    // En CI, fallar si hay errores de TypeScript
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    // En CI, fallar si hay errores de ESLint
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
