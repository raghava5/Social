/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'via.placeholder.com',
      'localhost',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
    ],
  },
};

module.exports = nextConfig;
