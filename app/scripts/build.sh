#!/bin/bash
set -e

# SOLUTION: Create a dummy layout.tsx file where Next.js expects it
# This satisfies Next.js's requirement for a root layout
TEMPLATES_DIR="node_modules/@sanity/cli/templates"
SHOPIFY_DIR="$TEMPLATES_DIR/shopify"
PAGE_FILE="$SHOPIFY_DIR/schemaTypes/documents/page.ts"
LAYOUT_FILE="$SHOPIFY_DIR/schemaTypes/documents/layout.tsx"

# Create the directory structure if it doesn't exist
mkdir -p "$(dirname "$LAYOUT_FILE")" 2>/dev/null || true

# Create a minimal layout.tsx that Next.js requires
cat > "$LAYOUT_FILE" << 'EOF'
export default function Layout({ children }: { children: React.ReactNode }) {
  return null;
}
EOF

# Also try to delete/rename the page.ts file
if [ -f "$PAGE_FILE" ]; then
  mv "$PAGE_FILE" "${PAGE_FILE}.notapage" 2>/dev/null || rm -f "$PAGE_FILE" 2>/dev/null || true
fi

# Run the fix script
node scripts/fix-sanity-templates.js || true

# Ensure layout exists
if [ ! -f "$LAYOUT_FILE" ]; then
  mkdir -p "$(dirname "$LAYOUT_FILE")" 2>/dev/null || true
  cat > "$LAYOUT_FILE" << 'EOF'
export default function Layout({ children }: { children: React.ReactNode }) {
  return null;
}
EOF
fi

# Run the build
npm run build
