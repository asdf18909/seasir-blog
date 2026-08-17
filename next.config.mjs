/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',

  // node:sqlite 是 Node 内置模块，标记为外部依赖，避免被打包进服务端 bundle
  serverExternalPackages: ['node:sqlite'],

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
}

export default nextConfig