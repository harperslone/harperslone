import type { NextConfig } from "next";

// CRITICAL: Delete problematic files/directories IMMEDIATELY when this config loads
// This MUST run synchronously before Next.js does ANY file scanning
const fs = require('fs');
const path = require('path');

// Delete shopify directory immediately - this runs at module load time
(function deleteShopifyTemplates() {
  try {
    const shopifyDir = path.join(process.cwd(), 'node_modules', '@sanity', 'cli', 'templates', 'shopify');
    if (fs.existsSync(shopifyDir)) {
      // Force delete with multiple attempts
      for (let i = 0; i < 5; i++) {
        try {
          fs.rmSync(shopifyDir, { recursive: true, force: true });
          break; // Success, exit loop
        } catch (e) {
          if (i === 4) {
            // Last attempt failed, try deleting the specific file
            const pageFile = path.join(shopifyDir, 'schemaTypes', 'documents', 'page.ts');
            if (fs.existsSync(pageFile)) {
              try {
                fs.unlinkSync(pageFile);
              } catch (e2) {
                // Try renaming as last resort
                try {
                  fs.renameSync(pageFile, pageFile + '.disabled');
                } catch (e3) {
                  // Give up
                }
              }
            }
          } else {
            // Wait a bit before retry
            const start = Date.now();
            while (Date.now() - start < 50) {}
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
