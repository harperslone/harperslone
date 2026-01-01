#!/bin/bash
set -e

# Delete shopify templates directory
rm -rf node_modules/@sanity/cli/templates/shopify 2>/dev/null || true

# Run the fix script
node scripts/fix-sanity-templates.js || true

# Run the build
npm run build

