import '@/app/globals.scss';
import type { Metadata } from 'next';
import GlobalProviders from './GlobalProviders';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),

  title: {
    template: '%s | ICE Forensic',
    default: 'ICE Forensic',
  },

  description: 'Digital Forensic Web Application',

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.ico',
  },

  openGraph: {
    type: 'website',
    images: [
      {
        url: '/pullLogo.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GlobalProviders>{children}</GlobalProviders>;
}
