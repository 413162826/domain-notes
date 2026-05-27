import crx3 from 'crx3';
import { existsSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { generateKeyPairSync } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const keyPath = join(root, 'domain-notes.pem');
const crxPath = join(root, 'domain-notes.crx');
const zipPath = join(root, 'domain-notes.zip');

if (!existsSync(keyPath)) {
  console.log('Generating private key (domain-notes.pem)...');
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  writeFileSync(keyPath, privateKey);
}

// Walk dist/ and collect every file
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(dist);
console.log(`Packing ${files.length} files from dist/ ...`);

await crx3(files, {
  keyPath,
  crxPath,
  zipPath,
});

console.log(`  ✓ ${relative(root, crxPath)}`);
console.log(`  ✓ ${relative(root, zipPath)}`);
console.log('\n建议安装方式: 打开 chrome://extensions → 开启"开发者模式" → "加载已解压的扩展程序" → 选择 dist/ 文件夹');
