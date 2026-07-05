import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconPath = join(__dirname, '..', 'public', 'brand', 'bosala-icon.png');
const tempPath = join(__dirname, '..', 'public', 'brand', 'bosala-icon.tmp.png');

const { data, info } = await sharp(iconPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r < 40 && g < 40 && b < 40) {
    data[i + 3] = 0;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(tempPath);

const fs = await import('fs/promises');
await fs.rename(tempPath, iconPath);

console.log('✓ Removed baked black background from bosala-icon.png');
