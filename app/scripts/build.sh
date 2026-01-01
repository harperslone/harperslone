#!/bin/bash
set -e

# Delete shopify templates directory multiple times to ensure it's gone
rm -rf node_modules/@sanity/cli/templates/shopify 2>/dev/null || true
sleep 0.1
rm -rf node_modules/@sanity/cli/templates/shopify 2>/dev/null || true

# Run the fix script
node scripts/fix-sanity-templates.js || true

# Delete again right before build
rm -rf node_modules/@sanity/cli/templates/shopify 2>/dev/null || true

# Run the build
npm run build

