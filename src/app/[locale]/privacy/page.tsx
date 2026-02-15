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

  const title = isKo
    ? '개인정보 처리방침 | ICE Forensic'
    : 'Privacy Policy | ICE Forensic';

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

export default function PrivacyPage() {
  return <PrivacyLayout />;
}
