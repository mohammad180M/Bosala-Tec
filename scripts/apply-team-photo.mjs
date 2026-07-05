import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(
  __dirname,
  '..',
  '..',
  '.cursor',
  'projects',
  'c-Users-JENIN-Desktop-Bosala-Tec',
  'assets',
  'c__Users_JENIN_AppData_Roaming_Cursor_User_workspaceStorage_00e3fb829722ee795a648a3890bafd7f_images_Zyoud-7755e8b6-92a0-4206-81ee-f9f67d234c82.png'
);

import { existsSync } from 'fs';

const altSrc =
  'C:/Users/JENIN/.cursor/projects/c-Users-JENIN-Desktop-Bosala-Tec/assets/c__Users_JENIN_AppData_Roaming_Cursor_User_workspaceStorage_00e3fb829722ee795a648a3890bafd7f_images_Zyoud-7755e8b6-92a0-4206-81ee-f9f67d234c82.png';

const input = existsSync(src) ? src : altSrc;
const outDir = join(__dirname, '..', 'public', 'team');
const size = 800;

await sharp(input)
  .resize(size, size, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 92 })
  .toFile(join(outDir, 'mohammad-zyoud.jpg'));

const depthSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#080808"/>
  <ellipse cx="400" cy="520" rx="200" ry="170" fill="#e8e8e8"/>
  <ellipse cx="400" cy="430" rx="150" ry="200" fill="#b0b0b0"/>
  <ellipse cx="400" cy="280" rx="70" ry="120" fill="#707070"/>
  <ellipse cx="400" cy="180" rx="35" ry="55" fill="#404040"/>
</svg>`;

await sharp(Buffer.from(depthSvg))
  .jpeg({ quality: 95 })
  .toFile(join(outDir, 'mohammad-zyoud-depth.jpg'));

console.log('✓ mohammad-zyoud.jpg');
console.log('✓ mohammad-zyoud-depth.jpg');
