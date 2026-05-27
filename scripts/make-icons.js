import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3a8eff"/>
      <stop offset="100%" stop-color="#1d63d4"/>
    </linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f2f6fc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0a3a7a" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Rounded square background -->
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>

  <!-- Subtle highlight -->
  <rect x="0" y="0" width="128" height="64" rx="28" fill="#ffffff" fill-opacity="0.07"/>

  <!-- Paper card -->
  <g filter="url(#shadow)">
    <rect x="24" y="22" width="68" height="84" rx="7" fill="url(#paper)"/>
    <!-- Folded corner -->
    <path d="M82 22 L92 32 L82 32 Z" fill="#dde6f3"/>
  </g>

  <!-- Text lines -->
  <rect x="33" y="38" width="50" height="5" rx="2.5" fill="#5a8fd6"/>
  <rect x="33" y="50" width="50" height="5" rx="2.5" fill="#bfd1e8"/>
  <rect x="33" y="62" width="38" height="5" rx="2.5" fill="#bfd1e8"/>
  <rect x="33" y="74" width="44" height="5" rx="2.5" fill="#bfd1e8"/>
  <rect x="33" y="86" width="28" height="5" rx="2.5" fill="#bfd1e8"/>

  <!-- Globe / domain accent -->
  <circle cx="98" cy="92" r="20" fill="#ffce3a" stroke="#ffffff" stroke-width="3.5"/>
  <ellipse cx="98" cy="92" rx="20" ry="9" fill="none" stroke="#d68b00" stroke-width="2" stroke-opacity="0.55"/>
  <line x1="98" y1="72" x2="98" y2="112" stroke="#d68b00" stroke-width="2" stroke-opacity="0.55"/>
</svg>`;

const sizes = [16, 48, 128];
const outDir = join(root, 'icons');
mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const out = join(outDir, `icon${size}.png`);
  await sharp(Buffer.from(SVG))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✓ ${out}`);
}
console.log('Icons generated.');
