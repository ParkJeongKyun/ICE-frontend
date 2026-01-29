import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/locales/routing';
import '@/app/index.scss';
import StyledComponentsRegistry from './StyledComponentsRegistry';
import { getMessages } from 'next-intl/server';
import { MessageProvider } from '@/contexts/MessageContext';
import ToastListener from '@/components/common/ToastListener/ToastListener';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale: locale || 'en' });

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="ICE Forensic - Digital Forensic Tools"
        />
        <meta
          name="keywords"
          content="hex viewer, exif, image metadata, digital forensics, forensic tool, 헥스 뷰어, 이미지 메타데이터, 디지털 포렌식"
        />
        <meta name="author" content="ParkJeongKyun" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://ice-forensic.com/" />
        <meta property="og:url" content="https://ice-forensic.com/" />
        <meta property="og:locale" content="ko_KR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ICE - Forensic Web Application" />
        <meta
          name="twitter:description"
          content="A web-based hex viewer and image metadata (Exif) analysis tool for digital forensics. 디지털 포렌식을 위한 웹 기반 헥스 뷰어 및 이미지 메타데이터(Exif) 분석 도구입니다."
        />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/logo.png" />
        <meta property="og:title" content="ICE - Forensic Web Application" />
        <meta property="og:type" content="article" />
        <meta
          property="og:description"
          content="A web-based hex viewer and image metadata (Exif) analysis tool for digital forensics. 디지털 포렌식을 위한 웹 기반 헥스 뷰어 및 이미지 메타데이터(Exif) 분석 도구입니다."
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="627" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <title>ICE Forensic</title>
        <meta name="google-adsense-account" content="ca-pub-9099594574723250" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-79876PQVY4"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-79876PQVY4');
          `,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MessageProvider>
            <ToastListener />
            {children}
          </MessageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
