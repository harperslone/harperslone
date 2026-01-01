#!/bin/bash
set -e

# CRITICAL: Rename page.ts to something Next.js won't recognize
# This is more reliable than deletion because Next.js might cache file lists
TEMPLATES_DIR="node_modules/@sanity/cli/templates"
SHOPIFY_DIR="$TEMPLATES_DIR/shopify"
PAGE_FILE="$SHOPIFY_DIR/schemaTypes/documents/page.ts"

# First, try to rename the file (more reliable than deletion)
if [ -f "$PAGE_FILE" ]; then
  mv "$PAGE_FILE" "${PAGE_FILE}.notapage" 2>/dev/null || true
fi

# Also delete the directory
rm -rf "$SHOPIFY_DIR" 2>/dev/null || true
rm -rf "$TEMPLATES_DIR" 2>/dev/null || true

# Recreate templates as empty
mkdir -p "$TEMPLATES_DIR" 2>/dev/null || true
touch "$TEMPLATES_DIR/.gitkeep" 2>/dev/null || true

# Run the fix script
node scripts/fix-sanity-templates.js || true

# Final cleanup - rename any remaining page.ts files
find "$TEMPLATES_DIR" -name "page.ts" -type f 2>/dev/null | while read -r file; do
  mv "$file" "${file}.notapage" 2>/dev/null || true
done

# Run the build
npm run build
