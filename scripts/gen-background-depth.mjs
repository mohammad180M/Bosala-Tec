import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'background');
mkdirSync(outDir, { recursive: true });

const W = 1920;
const H = 1080;

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

const color = Buffer.alloc(W * H * 3);
const depth = Buffer.alloc(W * H * 3);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const nx = x / W;
    const ny = y / H;

    const vignette = 1 - Math.pow(Math.hypot(nx - 0.5, ny - 0.5) * 1.15, 2);

    const cyanBlob = Math.exp(-((nx - 0.72) ** 2 + (ny - 0.38) ** 2) * 18) * 0.55;
    const violetBlob = Math.exp(-((nx - 0.28) ** 2 + (ny - 0.62) ** 2) * 14) * 0.5;
    const midGlow = Math.exp(-((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 6) * 0.12;

    const noise =
      (Math.sin(nx * 47.3 + ny * 31.7) +
        Math.sin(nx * 113.1 - ny * 67.4) * 0.5) *
      0.015;

    const r = clamp((3 + cyanBlob * 0 + violetBlob * 40 + midGlow * 20 + noise * 255) * vignette);
    const g = clamp((3 + cyanBlob * 180 + violetBlob * 20 + midGlow * 15 + noise * 255) * vignette);
    const b = clamp((6 + cyanBlob * 220 + violetBlob * 180 + midGlow * 25 + noise * 255) * vignette);

    color[i] = r;
    color[i + 1] = g;
    color[i + 2] = b;

    const d = clamp(
      (cyanBlob * 220 + violetBlob * 200 + midGlow * 90 + noise * 40) * vignette
    );
    depth[i] = d;
    depth[i + 1] = d;
    depth[i + 2] = d;
  }
}

await sharp(color, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 88 })
  .toFile(join(outDir, 'nebula.jpg'));

await sharp(depth, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 90 })
  .toFile(join(outDir, 'nebula-depth.jpg'));

console.log('✓ Generated public/background/nebula.jpg + nebula-depth.jpg');
