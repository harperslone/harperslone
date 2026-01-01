#!/bin/bash
set -e

# Delete the templates directory
rm -rf node_modules/@sanity/cli/templates 2>/dev/null || true

# Run the fix script
node scripts/fix-sanity-templates.js || true

# Delete again right before build
rm -rf node_modules/@sanity/cli/templates 2>/dev/null || true

# Run the build
npm run build
