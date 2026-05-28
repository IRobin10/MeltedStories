/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    optimizeFonts: false,
    transpilePackages: ['framer-motion', 'lucide-react'],
};

module.exports = nextConfig;
