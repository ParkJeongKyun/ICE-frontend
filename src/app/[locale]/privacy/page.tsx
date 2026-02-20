import type { Metadata } from 'next';
import PrivacyLayout from '@/layouts/PrivacyLayout/PrivacyLayout';
import { type Locale } from '@/locales/routing';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';

  const title = isKo ? '개인정보 처리방침' : 'Privacy Policy';

  const description = isKo
    ? 'ICE Forensic의 개인정보 처리방침. 클라이언트 기반 처리로 파일 데이터는 서버로 전송되지 않습니다.'
    : 'ICE Forensic Privacy Policy. Client-side processing ensures your files are never uploaded to our servers.';

  return {
    title: title,
    description: description,
    keywords: isKo
      ? ['개인정보 처리방침', '프라이버시', '데이터 보호', 'ICE Forensic']
      : ['Privacy Policy', 'Privacy', 'Data Protection', 'ICE Forensic'],
    alternates: {
      canonical: `${DOMAIN}/${locale}/privacy`,
      languages: {
        en: `${DOMAIN}/en/privacy`,
        ko: `${DOMAIN}/ko/privacy`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `${DOMAIN}/${locale}/privacy`,
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${DOMAIN}/pullLogo.png`,
          width: 1200,
          height: 630,
          alt: 'ICE Forensic',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [`${DOMAIN}/pullLogo.png`],
    },
  };
}

import fs from 'fs';
import path from 'path';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = (await params) as { locale: string };

  const filePath = path.join(
    process.cwd(),
    'public',
    'locales',
    locale,
    'markdown',
    'privacy.md'
  );

  let mdContent = '';
  try {
    mdContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Failed to read privacy.md on server:', err);
    mdContent = 'Privacy policy is temporarily unavailable.';
  }

  return <PrivacyLayout initialContent={mdContent} />;
}
