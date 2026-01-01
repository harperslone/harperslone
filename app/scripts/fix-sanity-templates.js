const fs = require('fs');
const path = require('path');

function findAndRenamePageFiles(dir, depth = 0) {
  // Limit recursion depth to avoid infinite loops
  if (depth > 10) return;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip .git, node_modules subdirectories, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          findAndRenamePageFiles(fullPath, depth + 1);
        }
      } else if (entry.isFile() && entry.name === 'page.ts') {
        // Delete page.ts files (more aggressive than renaming)
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted: ${fullPath}`);
        } catch (err) {
          // If deletion fails, try renaming as fallback
          try {
            const newPath = fullPath + '.bak';
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} -> ${newPath}`);
          } catch (renameErr) {
            console.error(`Error handling ${fullPath}:`, err.message);
          }
        }
      } else if (entry.isFile() && entry.name === 'page.ts.bak') {
        // Also delete .bak files to ensure clean state
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted backup: ${fullPath}`);
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
    console.log(`Scanning: ${templatesDir}`);
    findAndRenamePageFiles(templatesDir);
    found = true;
    break;
  }
}

if (!found) {
  console.log('Templates directory not found in any expected location');
} else {
  console.log('Done scanning for page.ts files');
}

