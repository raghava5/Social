/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 PERFORMANCE OPTIMIZATIONS
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion', 'date-fns'],
  },
  
  // 🚀 Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // 🚀 Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 🚀 Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate chunk for large libraries
          tensorflow: {
            test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
            name: 'tensorflow',
            priority: 10,
            chunks: 'async',
          },
          wavesurfer: {
            test: /[\\/]node_modules[\\/]wavesurfer\.js[\\/]/,
            name: 'wavesurfer',
            priority: 10,
            chunks: 'async',
          },
        },
      }
    }

    // Handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|flac|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[hash][ext]',
      },
    })

    return config
  },

  // 🚀 Runtime optimizations (removed deprecated swcMinify)
  compress: true,
  
  // 🚀 Runtime optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Existing configurations
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=30, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig;
