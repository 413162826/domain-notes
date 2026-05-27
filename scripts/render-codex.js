import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'infographic', 'infographic-codex.svg');
const out = join(root, 'infographic', 'infographic-codex.png');

const svgBuffer = readFileSync(src);

await sharp(svgBuffer, { density: 200 })
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`✓ ${out}`);
