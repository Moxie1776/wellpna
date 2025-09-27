// Script to remove problematic globalThis assignment from dist/generated/prisma/client.js
const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../dist/generated/prisma/client.js');

if (fs.existsSync(clientPath)) {
  let content = fs.readFileSync(clientPath, 'utf8');
  // Remove any line containing globalThis assignment
  content = content.replace(/.*globalThis\[.*\].*path\.dirname\(fileURLToPath\(import\.meta\.url\)\);?.*\n?/g, '// Manual patch: removed problematic globalThis assignment\n');
  fs.writeFileSync(clientPath, content, 'utf8');
  console.log('Patched dist/generated/prisma/client.js');
} else {
  console.log('dist/generated/prisma/client.js not found, skipping patch.');
}
