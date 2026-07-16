import sharp from 'sharp';
import { join } from 'path';
import { existsSync } from 'fs';

const src =
  'C:/Users/JENIN/.cursor/projects/c-Users-JENIN-Desktop-Bosala-Tec/assets/c__Users_JENIN_AppData_Roaming_Cursor_User_workspaceStorage_00e3fb829722ee795a648a3890bafd7f_images_IMG_1006-adad1184-1a1b-4f86-ab5e-347f45b810e4.png';

const outDir = join(process.cwd(), 'public', 'team');
const size = 800;

if (!existsSync(src)) {
  console.error('Source image not found:', src);
  process.exit(1);
}

const resized = sharp(src).resize(size, size, { fit: 'cover', position: 'centre' });

await resized.clone().jpeg({ quality: 92 }).toFile(join(outDir, 'ameed-nimer.jpg'));

await resized
  .clone()
  .greyscale()
  .blur(12)
  .normalize()
  .jpeg({ quality: 95 })
  .toFile(join(outDir, 'ameed-nimer-depth.jpg'));

console.log('✓ public/team/ameed-nimer.jpg');
console.log('✓ public/team/ameed-nimer-depth.jpg');
