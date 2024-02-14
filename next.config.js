/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    BASE_URL: 'https://crypto-calc-server.onrender.com/api/v1',
    ENV: 'production',
    ACCESS_TOKEN_EXPIRATION_TIME: '3600000',
    TIME_BUFFER: '300000',
    EMAIL: 'test@gmail.com',
    PASSWORD: 'Test@123',
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.coinranking.com',
      },
    ],
  },
};

module.exports = nextConfig;
