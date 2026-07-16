import sharp from 'sharp';
import toIco from 'to-ico';
import { readFile, mkdir, writeFile, unlink, copyFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const appDir = join(root, 'app');
const brandDir = join(publicDir, 'brand');

const ICON_SRC = join(brandDir, 'bosala-icon.png');
const LOCKUP_SRC = join(brandDir, 'bosala-lockup.png');
const BG = { r: 3, g: 3, b: 3, alpha: 1 };

const LEGACY_PNGS = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
];

async function ensureBrandAssets() {
  try {
    await readFile(ICON_SRC);
  } catch {
    console.error(
      'Missing brand asset. Place bosala-icon.png in public/brand/'
    );
    process.exit(1);
  }
}

async function iconPngBuffer(size) {
  return sharp(ICON_SRC)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function writeIconPng(size, filename) {
  const out = join(publicDir, filename);
  await sharp(await iconPngBuffer(size)).toFile(out);
  console.log(`  ✓ ${filename}`);
}

async function writeFaviconIco() {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(sizes.map((s) => iconPngBuffer(s)));
  const ico = await toIco(pngBuffers);
  const out = join(publicDir, 'favicon.ico');
  await writeFile(out, ico);
  const kb = (ico.length / 1024).toFixed(1);
  console.log(`  ✓ favicon.ico (${kb} KB, multi-size 16+32+48)`);
  if (ico.length < 5000 || ico.length > 40000) {
    console.warn(
      `  ⚠ favicon.ico size ${kb} KB outside expected 5–40 KB range — verify manually`
    );
  }
}

async function writeAppleTouchIcon() {
  const size = 180;
  const iconBuf = await sharp(ICON_SRC)
    .resize(140, 140, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: iconBuf, gravity: 'centre' }])
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));

  console.log('  ✓ apple-touch-icon.png');
}

async function writeOgImage() {
  try {
    await readFile(LOCKUP_SRC);
  } catch {
    console.log('  ⊘ brand/og-image.png skipped (no bosala-lockup.png)');
    return;
  }

  const width = 1200;
  const height = 630;
  const lockupWidth = Math.round(width * 0.7);

  const lockupBuf = await sharp(LOCKUP_SRC)
    .resize(lockupWidth, null, { fit: 'inside' })
    .png()
    .toBuffer();

  const lockupMeta = await sharp(lockupBuf).metadata();
  const lockupH = lockupMeta.height ?? Math.round(lockupWidth / 3);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      {
        input: lockupBuf,
        top: Math.round((height - lockupH) / 2),
        left: Math.round((width - lockupWidth) / 2),
      },
    ])
    .png()
    .toFile(join(brandDir, 'og-image.png'));

  console.log('  ✓ brand/og-image.png');
}

async function removeLegacyIcons() {
  for (const name of LEGACY_PNGS) {
    try {
      await unlink(join(publicDir, name));
      console.log(`  ⊘ removed legacy ${name}`);
    } catch {
    }
  }
}

async function syncAppIcons() {
  await mkdir(appDir, { recursive: true });
  const copies = [
    ['favicon.ico', 'favicon.ico'],
    ['icon-192.png', 'icon.png'],
    ['apple-touch-icon.png', 'apple-icon.png'],
  ];

  for (const [from, to] of copies) {
    await copyFile(join(publicDir, from), join(appDir, to));
    console.log(`  ✓ app/${to}`);
  }
}

async function main() {
  await ensureBrandAssets();
  await mkdir(brandDir, { recursive: true });

  console.log('Generating icons from public/brand/bosala-icon.png…');
  await writeIconPng(16, 'favicon-16.png');
  await writeIconPng(32, 'favicon-32.png');
  await writeIconPng(48, 'favicon-48.png');
  await writeFaviconIco();
  await writeIconPng(192, 'icon-192.png');
  await writeIconPng(512, 'icon-512.png');
  await writeAppleTouchIcon();
  await writeOgImage();
  await removeLegacyIcons();
  await syncAppIcons();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
