import type { NextConfig } from "next";

// CRITICAL: Delete problematic files/directories IMMEDIATELY when this config loads
// This MUST run synchronously before Next.js does ANY file scanning
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Delete shopify directory immediately using multiple methods
(function deleteShopifyTemplates() {
  try {
    const shopifyDir = path.join(process.cwd(), 'node_modules', '@sanity', 'cli', 'templates', 'shopify');
    const pageFile = path.join(shopifyDir, 'schemaTypes', 'documents', 'page.ts');
    
    // Method 1: Try using shell command (most reliable)
    try {
      execSync(`rm -rf "${shopifyDir}"`, { stdio: 'ignore' });
    } catch (e) {
      // Method 2: Try Node.js fs.rmSync
      try {
        if (fs.existsSync(shopifyDir)) {
          fs.rmSync(shopifyDir, { recursive: true, force: true });
        }
      } catch (e2) {
        // Method 3: Try deleting just the file
        try {
          if (fs.existsSync(pageFile)) {
            fs.unlinkSync(pageFile);
          }
        } catch (e3) {
          // Method 4: Try renaming the file
          try {
            if (fs.existsSync(pageFile)) {
              fs.renameSync(pageFile, pageFile + '.disabled');
            }
          } catch (e4) {
            // All methods failed, but continue anyway
          }
        }
      }
    }
  } catch (e) {
    // Silently fail - we'll try again in webpack config
  }
})();

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
