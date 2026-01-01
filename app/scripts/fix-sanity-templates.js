const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main: Completely remove the @sanity/cli/templates directory
const possibleDirs = [
  path.join(process.cwd(), 'node_modules', '@sanity', 'cli', 'templates'),
  path.join(__dirname, '..', 'node_modules', '@sanity', 'cli', 'templates'),
  path.resolve('node_modules', '@sanity', 'cli', 'templates'),
];

for (const templatesDir of possibleDirs) {
  try {
    // Use multiple methods to ensure deletion
    try {
      execSync(`rm -rf "${templatesDir}"`, { stdio: 'inherit' });
    } catch (e) {}
    
    if (fs.existsSync(templatesDir)) {
      fs.rmSync(templatesDir, { recursive: true, force: true });
    }
    
    console.log(`Processed: ${templatesDir}`);
  } catch (err) {
    console.log(`Note: ${templatesDir} - ${err.message}`);
  }
}

console.log('Done processing templates');

