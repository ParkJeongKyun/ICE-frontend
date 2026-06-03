import type { Metadata } from 'next';
import { CRITICAL_CSS } from '@/components/common/CriticalCss';
import GoogleScripts from '../GoogleScripts';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var config = JSON.parse(localStorage.getItem('ice_user_config'));
                  var theme = config ? config.theme : 'system';
                  var isDark = false;

                  if (theme === 'dark') {
                    isDark = true;
                  } else if (theme === 'light') {
                    isDark = false;
                  } else {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }

                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  var locale = localStorage.getItem('user-locale');
                  if (locale && (locale === 'ko' || locale === 'en')) {
                    if (window.location.pathname === '/' || window.location.pathname === '') {
                      window.location.replace('/' + locale);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta name="robots" content="index,follow" />
      </head>
      <body>
        {children}
        <GoogleScripts />
      </body>
    </html>
  );
}
