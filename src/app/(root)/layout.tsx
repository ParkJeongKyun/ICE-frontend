import type { Metadata } from 'next';
import CriticalCss from '@/components/common/CriticalCss';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export const metadata: Metadata = {
  title: 'ICE Forensic | Online Hex Viewer & EXIF Analysis',
  description:
    'Select your language to start using ICE Forensic tools. Web-based digital forensics without installation.',
  alternates: {
    canonical: DOMAIN,
    languages: {
      ko: `${DOMAIN}/ko`,
      en: `${DOMAIN}/en`,
      'x-default': DOMAIN,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <CriticalCss />
        <meta name="robots" content="index,follow" />
        {/* 재방문자만 조용히 이동 — 봇은 localStorage 없으므로 영향 없음 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('user-locale');if(s==='ko'||s==='en'){var p=window.location.pathname;if(p==='/'||p===''){window.location.replace('/'+s);}}}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
