import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import { manrope, michroma } from '@/lib/fonts';
import { siteDescription, siteUrl } from '@/lib/site';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Bosala Technology — Building the Platforms of Tomorrow',
  description: siteDescription,
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Bosala Technology — Building the Platforms of Tomorrow',
    description: siteDescription,
    url: siteUrl,
    siteName: 'Bosala Technology',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bosala Technology — Building the Platforms of Tomorrow',
    description: siteDescription,
    images: ['/brand/og-image.png'],
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bosala Technology',
  url: siteUrl,
  logo: `${siteUrl}/brand/bosala-icon.png`,
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
