import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storeRoot = join(__dirname, '..');
const srcDir = join(storeRoot, 'images', 'src');
const outDir = join(storeRoot, 'images');

mkdirSync(outDir, { recursive: true });

// Render at high density for crisp rasterization, then resize to EXACT target dims.
// Microsoft Edge store validates dimensions strictly.
const targets = [
  { name: 'logo-300',         w: 300,  h: 300  },
  { name: 'tile-440x280',     w: 440,  h: 280  },
  { name: 'tile-1400x560',    w: 1400, h: 560  },
  { name: 'screenshot-1',     w: 1280, h: 800  },
  { name: 'screenshot-2',     w: 1280, h: 800  },
  { name: 'screenshot-3',     w: 1280, h: 800  },
  { name: 'screenshot-4',     w: 1280, h: 800  },
  { name: 'screenshot-5',     w: 1280, h: 800  },
];

for (const { name, w, h } of targets) {
  const src = join(srcDir, `${name}.svg`);
  const out = join(outDir, `${name}.png`);
  const buf = readFileSync(src);
  // Use density that produces ~2x the target for high quality, then downscale.
  const density = Math.max(150, Math.ceil((w / 1000) * 72 * 2.5));
  await sharp(buf, { density })
    .resize(w, h, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`  ✓ ${basename(out)}  ${meta.width}x${meta.height}`);
}

console.log(`\nAll PNGs at exact dimensions in: ${outDir}`);
