import { cpSync, copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

// Copy manifest
copyFileSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
console.log('  ✓ manifest.json');

// Copy icons
mkdirSync(join(dist, 'icons'), { recursive: true });
cpSync(join(root, 'icons'), join(dist, 'icons'), { recursive: true });
console.log('  ✓ icons/');

// Vite outputs popup.html at dist/popup.html — good.
// Verify file exists
const popupHtml = join(dist, 'popup.html');
if (!existsSync(popupHtml)) {
  console.error('  ✗ dist/popup.html missing!');
  process.exit(1);
}

console.log('Post-build done. dist/ is ready.');
