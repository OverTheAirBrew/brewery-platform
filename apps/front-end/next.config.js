/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/metrics',
        destination: '/api/prometheus',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
