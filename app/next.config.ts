import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  webpack: (config) => {
    // Ignore Sanity CLI template files that shouldn't be processed
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@sanity\/cli\/templates/,
      })
    );
    return config;
  },
};

export default nextConfig;
