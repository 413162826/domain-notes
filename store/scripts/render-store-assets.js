import sharp from 'sharp';
import { readFileSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storeRoot = join(__dirname, '..');
const srcDir = join(storeRoot, 'images', 'src');
const outDir = join(storeRoot, 'images');

mkdirSync(outDir, { recursive: true });

const targets = [
  // Screenshots: 1280x800, density 1 (already authored at native size)
  { name: 'screenshot-1', density: 200 },
  { name: 'screenshot-2', density: 200 },
  { name: 'screenshot-3', density: 200 },
  { name: 'screenshot-4', density: 200 },
  { name: 'screenshot-5', density: 200 },
  // Promo tiles
  { name: 'tile-440x280', density: 300 },
  { name: 'tile-1400x560', density: 200 },
  // Logo
  { name: 'logo-300', density: 600 },
];

for (const { name, density } of targets) {
  const src = join(srcDir, `${name}.svg`);
  const out = join(outDir, `${name}.png`);
  const buf = readFileSync(src);
  await sharp(buf, { density })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✓ ${basename(out)}`);
}

console.log(`\nAll PNGs in: ${outDir}`);
