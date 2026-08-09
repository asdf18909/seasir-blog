/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  trailingSlash: true,

  basePath: '/seasir-blog',

  assetPrefix: '/seasir-blog/',
}

export default nextConfig