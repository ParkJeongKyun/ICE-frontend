import { NextIntlClientProvider } from 'next-intl';
import { routing, type Locale } from '@/locales/routing';
import { getMessages } from 'next-intl/server';
import { MessageProvider } from '@/contexts/MessageContext/MessageContext';
import { redirect } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import JsonLd from './JsonLd';
import GoogleScripts from './GoogleScripts';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const isKo = locale === 'ko';

  const description = isKo
    ? '설치 없이 웹에서 바로 사용하는 디지털 포렌식 도구. 헥스 뷰어로 파일 구조 분석, 파일 헤더 검사, 이미지 EXIF 메타데이터 추출, SHA256/SHA512 해시 계산 등을 지원합니다.'
    : 'Web-based digital forensics tool without installation. Supports Hex Viewer, File Header Analysis, Image EXIF Metadata Extraction, and File Hash Calculator.';

  const keywords = isKo
    ? ['헥스 뷰어', '디지털 포렌식', 'EXIF 분석기', '파일 해시 계산']
    : [
        'Hex Viewer',
        'Digital Forensics',
        'EXIF Viewer',
        'File Hash Calculator',
      ];

  return {
    description,
    keywords,
    openGraph: {
      locale: isKo ? 'ko_KR' : 'en_US',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };

  // 유효하지 않은 locale이면 기본 언어로 리다이렉트
  if (!routing.locales.includes(locale)) {
    redirect('/en');
  }

  const messages = await getMessages({ locale: locale || 'en' });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content={`${DOMAIN}/logo.png`} />
        <link rel="manifest" href={`${DOMAIN}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${DOMAIN}/logo.png`} />
        <meta name="google-adsense-account" content="ca-pub-9099594574723250" />
        {/* Security: CSP & Referrer (GitHub Pages는 서버 헤더 불가 → 메타 태그로 대체) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://www.google-analytics.com https://analytics.google.com; worker-src 'self' blob:; manifest-src 'self' https://www.ice-forensic.com;"
        />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body suppressHydrationWarning>
        <JsonLd locale={locale} />

        {/* Google scripts (production only) */}
        <GoogleScripts />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <MessageProvider>{children}</MessageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
