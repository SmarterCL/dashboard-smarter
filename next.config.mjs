/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Silencia el warning de workspace root por lockfile en directorio padre
  experimental: {
    outputFileTracingRoot: "/Users/mac/dev/2026/septiembre/dashboard-smarter",
  },
}

export default nextConfig