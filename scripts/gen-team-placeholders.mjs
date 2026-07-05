import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'team');
const size = 800;

const portraitSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1a1030"/>
      <stop offset="55%" stop-color="#0d0d11"/>
      <stop offset="100%" stop-color="#030303"/>
    </radialGradient>
    <radialGradient id="face" cx="50%" cy="38%" r="28%">
      <stop offset="0%" stop-color="#2a2040" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#120e1a" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#030303" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shoulder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1630" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#030303" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <ellipse cx="400" cy="520" rx="220" ry="140" fill="url(#shoulder)"/>
  <ellipse cx="400" cy="310" rx="130" ry="155" fill="url(#face)"/>
  <ellipse cx="400" cy="280" rx="72" ry="88" fill="#221a32" opacity="0.55"/>
</svg>
`;

const depthSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="depth" cx="50%" cy="38%" r="42%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#c8c8c8"/>
      <stop offset="72%" stop-color="#555555"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#050505"/>
  <ellipse cx="400" cy="310" rx="200" ry="240" fill="url(#depth)"/>
</svg>
`;

await sharp(Buffer.from(portraitSvg)).jpeg({ quality: 88 }).toFile(join(outDir, 'mohammad-zyoud.jpg'));
await sharp(Buffer.from(depthSvg)).jpeg({ quality: 92 }).toFile(join(outDir, 'mohammad-zyoud-depth.jpg'));

console.log('✓ public/team/mohammad-zyoud.jpg');
console.log('✓ public/team/mohammad-zyoud-depth.jpg');
