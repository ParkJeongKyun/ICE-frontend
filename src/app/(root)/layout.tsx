import type { Metadata } from 'next';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export const metadata: Metadata = {
  title: 'Online Hex Viewer & Online EXIF Viewer',
  description:
    'Web-based digital forensics tool. Supports Hex Viewer, File Header Analysis, and Image EXIF Metadata Analysis.',
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
        <meta name="robots" content="index,follow" />

        {/* 1) JS 비활성 환경(크롤러 포함)을 위한 안전한 리다이렉트 */}
        <noscript>
          <meta httpEquiv="refresh" content="0; url=/en" />
        </noscript>

        {/* 2) 일반 사용자(일반 브라우저) — React가 실행되기 전에 즉시 실행되는 빠른 클라이언트 리다이렉트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var supported = ['ko','en'];
                  var defaultLang = 'en';
                  var saved = null;
                  try { saved = localStorage.getItem('user-locale'); } catch(e) { saved = null; }
                  var browser = (navigator.language || navigator.userLanguage || '').split('-')[0] || '';

                  var target = defaultLang;
                  if (saved && supported.indexOf(saved) !== -1) {
                    target = saved;
                  } else if (browser && supported.indexOf(browser) !== -1) {
                    target = browser;
                  }

                  // 빠르고 안전한 교체 (히스토리 남기지 않음)
                  if (window.location.pathname === '/' || window.location.pathname === '') {
                    window.location.replace('/' + target);
                  }
                } catch (err) {
                  try { window.location.replace('/en'); } catch (e) { /* ignore */ }
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
