/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
    images: {
        remotePatterns: [{
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/media/images/**',
            },
            {
                protocol: 'https',
                hostname: 'localhost',
                port: '',
                pathname: '/media/images/**',
            },
        ],
        unoptimized: true,
    },
    env: {
        API_URL: process.env.DJANGO_HOST,
    },
    webpack: (config, { isServer }) => {
        config.cache = false;
        return config;
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    react: false,
};

export default nextConfig;