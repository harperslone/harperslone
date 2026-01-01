#!/bin/bash
set -e

# NUCLEAR OPTION: Delete the entire templates directory and recreate it empty
# This prevents Next.js from finding ANY page.ts files
TEMPLATES_DIR="node_modules/@sanity/cli/templates"
SHOPIFY_DIR="$TEMPLATES_DIR/shopify"

# Delete everything
rm -rf "$TEMPLATES_DIR" 2>/dev/null || true

# Recreate as empty directory with a .gitkeep file
mkdir -p "$TEMPLATES_DIR" 2>/dev/null || true
touch "$TEMPLATES_DIR/.gitkeep" 2>/dev/null || true

# Also specifically target shopify
rm -rf "$SHOPIFY_DIR" 2>/dev/null || true

# Run the fix script
node scripts/fix-sanity-templates.js || true

# Final cleanup
rm -rf "$SHOPIFY_DIR" 2>/dev/null || true
rm -rf "$TEMPLATES_DIR/shopify" 2>/dev/null || true

# Run the build
npm run build
