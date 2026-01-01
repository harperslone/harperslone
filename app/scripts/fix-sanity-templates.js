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
      } else if (entry.isFile() && (entry.name === 'page.ts' || entry.name === 'page.ts.bak')) {
        // Delete page.ts files
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted: ${fullPath}`);
        } catch (err) {
          console.error(`Error deleting ${fullPath}:`, err.message);
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
    
    // First, try to delete the entire shopify subdirectory (where page.ts is)
    const shopifyDir = path.join(templatesDir, 'shopify');
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

