export const siteUrl = 'https://bosala.ps';

export const siteDescription =
  'Bosala Technology builds innovative digital platforms with immersive technology experiences—crafted with precision, vision, and engineering excellence.';

/** Bump when replacing public/brand/bosala-icon.png so crawlers pick up the new favicon. */
export const siteIconVersion = '2026-07-16';

export function assetUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${normalized}?v=${siteIconVersion}`;
}
