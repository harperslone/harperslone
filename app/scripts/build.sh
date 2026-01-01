#!/bin/bash
set -e

# SOLUTION: Replace the problematic page.ts with an empty TypeScript file
# This ensures Next.js doesn't treat it as a page route
TEMPLATES_DIR="node_modules/@sanity/cli/templates"
SHOPIFY_DIR="$TEMPLATES_DIR/shopify"
PAGE_FILE="$SHOPIFY_DIR/schemaTypes/documents/page.ts"

# Delete the entire templates directory first
rm -rf "$TEMPLATES_DIR" 2>/dev/null || true

# If somehow the file still exists (from cache), replace it with an empty export
if [ -f "$PAGE_FILE" ]; then
  echo "// Disabled" > "$PAGE_FILE"
fi

# Run prebuild which also runs fix script
node scripts/fix-sanity-templates.js || true

# Final check - delete again right before build
rm -rf "$SHOPIFY_DIR" 2>/dev/null || true
rm -rf "$TEMPLATES_DIR" 2>/dev/null || true

# Run next build directly (skip the npm run build to avoid prebuild running again)
rm -rf node_modules/@sanity/cli/templates 2>/dev/null || true
npx next build --webpack
