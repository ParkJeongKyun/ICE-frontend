import type { Metadata } from 'next';
import AboutLayout from '@/layouts/AboutLayout/AboutLayout';
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
    ? '개발자 소개 | ICE Forensic'
    : 'About Developer | ICE Forensic';

  const description = isKo
    ? '박정균 개발자 소개. 디지털 포렌식, 정보보안, 침해사고대응 전문가.'
    : 'Park Jeong Kyun - Digital Forensics, Information Security, and Incident Response Expert.';

  return {
    title: title,
    description: description,
    keywords: isKo
      ? ['개발자 소개', '박정균', '디지털 포렌식', '정보보안', '포렌식 전문가']
      : [
          'About Developer',
          'Park Jeong Kyun',
          'Digital Forensics',
          'Information Security',
        ],
    alternates: {
      canonical: `${DOMAIN}/${locale}/about`,
      languages: {
        en: `${DOMAIN}/en/about`,
        ko: `${DOMAIN}/ko/about`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `${DOMAIN}/${locale}/about`,
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'profile',
      images: [
        {
          url: `${DOMAIN}/pullLogo.png`,
          width: 1200,
          height: 630,
          alt: 'ICE Forensic - Developer Profile',
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

export default function AboutPage() {
  return <AboutLayout />;
}
