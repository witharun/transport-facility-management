// Script to copy index.html to 404.html for GitHub Pages routing support
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'transport-facility');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Created 404.html for GitHub Pages routing support');
} else {
  console.error('✗ Error: index.html not found. Make sure to build the project first.');
  process.exit(1);
}
