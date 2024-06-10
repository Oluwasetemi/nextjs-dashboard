/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //    reactCompiler: true,
  //  },
  images: {
      remotePatterns: [
            {
              protocol: 'https',
              hostname: 'avatars.githubusercontent.com',
              port: '',
              // pathname: '/account123/**',
            },
      ],
    },
};

module.exports = nextConfig;
