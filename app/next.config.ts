import type { NextConfig } from "next";

// Delete problematic files/directories before Next.js config is evaluated
try {
  const fs = require('fs');
  const path = require('path');
  const templatesDir = path.join(process.cwd(), 'node_modules', '@sanity', 'cli', 'templates');
  if (fs.existsSync(templatesDir)) {
    // First, try to delete the entire shopify directory (where page.ts is)
    const shopifyDir = path.join(templatesDir, 'shopify');
    if (fs.existsSync(shopifyDir)) {
      try {
        fs.rmSync(shopifyDir, { recursive: true, force: true });
      } catch (e) {
        // If that fails, try deleting individual page.ts files
        function deletePageFiles(dir: string, depth = 0) {
          if (depth > 10) return;
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                deletePageFiles(fullPath, depth + 1);
              } else if (entry.isFile() && (entry.name === 'page.ts' || entry.name === 'page.ts.bak')) {
                try {
                  fs.unlinkSync(fullPath);
                } catch (e) {
                  // Ignore errors
                }
              }
            }
          } catch (e) {
            // Ignore errors
          }
        }
        deletePageFiles(templatesDir);
      }
    }
  }
} catch (e) {
  // Ignore errors during config load
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // Exclude Sanity CLI from being processed
  serverExternalPackages: ['@sanity/cli'],
  // Exclude from file tracing
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@sanity/cli/**/*',
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore Sanity CLI template files that shouldn't be processed
    const webpack = require('webpack');
    const fs = require('fs');
    const path = require('path');
    
    // Aggressively delete page.ts files before webpack processes them
    const templatesDir = path.join(process.cwd(), 'node_modules', '@sanity', 'cli', 'templates');
    if (fs.existsSync(templatesDir)) {
      function deletePageFiles(dir: string, depth = 0) {
        if (depth > 10) return;
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
              deletePageFiles(fullPath, depth + 1);
            } else if (entry.isFile() && (entry.name === 'page.ts' || entry.name === 'page.ts.bak')) {
              try {
                fs.unlinkSync(fullPath);
              } catch (e) {
                // Ignore errors
              }
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
      deletePageFiles(templatesDir);
    }
    
    // Add IgnorePlugin to exclude template files from all contexts
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@sanity\/cli\/templates/,
      })
    );
    
    // Exclude from module resolution - make it resolve to false/null
    config.resolve.alias = {
      ...config.resolve.alias,
      '@sanity/cli/templates': false,
    };
    
    // Add a rule to ignore these files completely (both server and client)
    config.module.rules.push({
      test: /node_modules\/@sanity\/cli\/templates\/.*\.ts$/,
      use: 'ignore-loader',
      enforce: 'pre', // Apply before other loaders
    });
    
    return config;
  },
};

export default nextConfig;
