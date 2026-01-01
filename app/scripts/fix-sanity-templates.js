const fs = require('fs');
const path = require('path');

function deleteDirectory(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`Deleted directory: ${dir}`);
      // Create an empty .gitkeep file to prevent the directory from being recreated
      const parentDir = path.dirname(dir);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      // Create a dummy file to replace the directory
      fs.writeFileSync(dir + '.disabled', '');
      return true;
    }
  } catch (err) {
    console.error(`Error deleting directory ${dir}:`, err.message);
  }
  return false;
}

function findAndDeletePageFiles(dir, depth = 0) {
  // Limit recursion depth to avoid infinite loops
  if (depth > 10) return;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip .git, node_modules subdirectories, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          findAndDeletePageFiles(fullPath, depth + 1);
        }
      } else if (entry.isFile() && entry.name === 'page.ts') {
        // Rename page.ts files so Next.js won't recognize them
        try {
          fs.renameSync(fullPath, fullPath + '.notapage');
          console.log(`Renamed: ${fullPath} -> ${fullPath}.notapage`);
        } catch (err) {
          // If rename fails, try deleting
          try {
            fs.unlinkSync(fullPath);
            console.log(`Deleted: ${fullPath}`);
          } catch (err2) {
            console.error(`Error handling ${fullPath}:`, err.message);
          }
        }
      } else if (entry.isFile() && (entry.name === 'page.ts.bak' || entry.name === 'page.ts.disabled')) {
        // Delete backup/disabled files
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted: ${fullPath}`);
        } catch (err) {
          // Ignore errors for backup files
        }
      }
    }
  } catch (err) {
    // Ignore errors (directory might not exist, permissions, etc.)
  }
}

// Main execution - try multiple possible locations
const possibleDirs = [
  path.join(process.cwd(), 'node_modules', '@sanity', 'cli', 'templates'),
  path.join(__dirname, '..', 'node_modules', '@sanity', 'cli', 'templates'),
  path.resolve('node_modules', '@sanity', 'cli', 'templates'),
];

let found = false;
for (const templatesDir of possibleDirs) {
  if (fs.existsSync(templatesDir)) {
    console.log(`Found templates directory: ${templatesDir}`);
    
    // First, try to create a layout.tsx file to satisfy Next.js
    const shopifyDir = path.join(templatesDir, 'shopify');
    const pageFile = path.join(shopifyDir, 'schemaTypes', 'documents', 'page.ts');
    const layoutFile = path.join(shopifyDir, 'schemaTypes', 'documents', 'layout.tsx');
    
    if (fs.existsSync(pageFile)) {
      try {
        const layoutDir = path.dirname(layoutFile);
        if (!fs.existsSync(layoutDir)) {
          fs.mkdirSync(layoutDir, { recursive: true });
        }
        fs.writeFileSync(layoutFile, 'export default function Layout({ children }: { children: React.ReactNode }) {\n  return null;\n}\n');
        console.log(`Created layout.tsx at ${layoutFile}`);
        found = true;
        break;
      } catch (err) {
        console.error(`Error creating layout: ${err.message}`);
      }
    }
    
    // If that fails, try to delete the shopify directory
    if (fs.existsSync(shopifyDir)) {
      if (deleteDirectory(shopifyDir)) {
        console.log('Deleted shopify templates directory');
        found = true;
        break;
      }
    }
    
    // If that fails, scan and delete individual page.ts files
    console.log(`Scanning: ${templatesDir}`);
    findAndDeletePageFiles(templatesDir);
    found = true;
    break;
  }
}

if (!found) {
  console.log('Templates directory not found in any expected location');
} else {
  console.log('Done processing templates');
}

