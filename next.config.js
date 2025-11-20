/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,          // إذا كنت تستخدم app directory
  },
  images: {
    unoptimized: true,     // لتجنب مشاكل الصور على Netlify
  },
}

module.exports = nextConfig
