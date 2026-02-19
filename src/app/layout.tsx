import '@/app/globals.scss';
import type { Metadata } from 'next';
import GlobalProviders from './GlobalProviders';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),

  // title template defined once at app root — pages provide plain titles
  title: {
    template: '%s | ICE Forensic',
    default: 'ICE Forensic',
  },

  // invariant global metadata
  authors: [
    {
      name: 'Park Jeong Kyun',
      url: DOMAIN,
    },
  ],
  creator: 'Park Jeong Kyun',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },

  // common OpenGraph assets only (page-specific title/description are set per-page)
  openGraph: {
    type: 'website',
    siteName: 'ICE Forensic',
    images: [
      {
        url: `${DOMAIN}/pullLogo.png`,
        width: 1200,
        height: 630,
        alt: 'ICE Forensic Logo',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    images: [`${DOMAIN}/pullLogo.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GlobalProviders>{children}</GlobalProviders>;
}
