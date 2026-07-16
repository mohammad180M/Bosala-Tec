import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import { manrope, michroma } from '@/lib/fonts';
import { assetUrl, siteDescription, siteUrl } from '@/lib/site';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030303',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Bosala Technology — Building the Platforms of Tomorrow',
  description: siteDescription,
  applicationName: 'Bosala Technology',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: assetUrl('/favicon-16.png'), sizes: '16x16', type: 'image/png' },
      { url: assetUrl('/favicon-32.png'), sizes: '32x32', type: 'image/png' },
      { url: assetUrl('/favicon-48.png'), sizes: '48x48', type: 'image/png' },
      { url: assetUrl('/favicon.ico'), sizes: 'any' },
    ],
    apple: assetUrl('/apple-touch-icon.png'),
    other: [
      {
        rel: 'icon',
        url: assetUrl('/icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: assetUrl('/icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: 'Bosala Technology — Building the Platforms of Tomorrow',
    description: siteDescription,
    url: siteUrl,
    siteName: 'Bosala Technology',
    images: [{ url: assetUrl('/brand/og-image.png'), width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bosala Technology — Building the Platforms of Tomorrow',
    description: siteDescription,
    images: [assetUrl('/brand/og-image.png')],
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bosala Technology',
  url: siteUrl,
  logo: `${siteUrl}${assetUrl('/brand/bosala-icon.png')}`,
  founder: {
    '@type': 'Person',
    name: 'Mohammad Zyoud',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${michroma.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
