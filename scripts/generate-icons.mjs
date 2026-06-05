import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'assets', 'images', 'icon-source.jpg');
const outDir = path.join(root, 'assets', 'images', 'icons');

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

/** Treat light neutral pixels (white / checkerboard gray) as transparent. */
function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  const avg = (r + g + b) / 3;
  if (avg > 248 && spread < 12) return true;
  if (avg > 175 && avg < 225 && spread < 18) return true;
  return false;
}

async function buildMasterPng() {
  const { data, info } = await sharp(sourcePath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (isBackground(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png();
}

mkdirSync(outDir, { recursive: true });

const master = await buildMasterPng();
const masterPath = path.join(outDir, 'icon-1024.png');
await master.clone().toFile(masterPath);

for (const size of SIZES) {
  const outPath = path.join(outDir, `icon-${size}.png`);
  await master
    .clone()
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

const defaultIcon = path.join(root, 'assets', 'images', 'icon.png');
await master
  .clone()
  .resize(512, 512, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toFile(defaultIcon);

console.log('Icons written:', [masterPath, defaultIcon, ...SIZES.map((s) => `icon-${s}.png`)].join('\n  '));