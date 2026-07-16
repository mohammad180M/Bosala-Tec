import type { MetadataRoute } from 'next';
import { assetUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bosala Technology',
    short_name: 'Bosala',
    description:
      'Building innovative digital platforms with immersive technology experiences.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030303',
    theme_color: '#030303',
    icons: [
      {
        src: assetUrl('/icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: assetUrl('/icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
