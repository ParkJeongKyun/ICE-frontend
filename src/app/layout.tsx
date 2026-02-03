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

  description:
    'Web-based digital forensics tool without installation. Supports Hex Viewer, File Header Analysis, and Image EXIF Metadata Analysis.',

  authors: [
    {
      name: 'Park Jeong Kyun',
      url: 'https://www.ice-forensic.com',
    },
  ],

  creator: 'Park Jeong Kyun',

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.ico',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: DOMAIN,
    siteName: 'ICE Forensic',
    title: 'ICE Forensic - Online Hex Viewer & EXIF Viewer',
    description:
      'Web-based digital forensics tool without installation. Supports Hex Viewer, File Header Analysis, and Image EXIF Metadata Analysis.',
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
    title: 'ICE Forensic - Online Hex Viewer & EXIF Viewer',
    description: 'Web-based digital forensics tool without installation.',
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
