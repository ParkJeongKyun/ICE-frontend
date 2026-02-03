import { type Locale } from '@/locales/routing';

interface JsonLdProps {
  locale: Locale;
}

export default function JsonLd({ locale }: JsonLdProps) {
  const isKo = locale === 'ko';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ICE Forensic',
    url: 'https://www.ice-forensic.com',
    logo: 'https://www.ice-forensic.com/logo.png',
    description: isKo
      ? '웹 기반 디지털 포렌식 도구'
      : 'Web-based Digital Forensic Tool',
    inLanguage: isKo ? 'ko' : 'en',
    sameAs: ['https://github.com/ParkJeongKyun/ICE-frontend'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Technical Support',
      email: 'dbzoseh84@gmail.com',
    },
  };

  const webApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ICE Forensic',
    url: 'https://www.ice-forensic.com',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    description: isKo
      ? '설치 없이 웹에서 바로 사용하는 디지털 포렌식 도구. 헥스 뷰어, 파일 헤더 분석, 이미지 EXIF 메타데이터 분석을 지원합니다.'
      : 'Web-based digital forensics tool without installation. Supports Hex Viewer, File Header Analysis, and Image EXIF Metadata Analysis.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'Park Jeong Kyun',
      email: 'dbzoseh84@gmail.com',
    },
    inLanguage: isKo ? 'ko' : 'en',
  };

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Park Jeong Kyun',
    birthDate: '2001-02-23',
    nationality: 'South Korea',
    email: 'dbzoseh84@gmail.com',
    jobTitle: [
      'Digital Forensics Expert',
      'Security Engineer',
      'Full-Stack Developer',
    ],
    worksFor: [
      {
        '@type': 'Organization',
        name: 'ParkJeongKyun',
      },
    ],
    knowsAbout: [
      'Digital Forensics',
      'Information Security',
      'Incident Response',
      'Full-Stack Development',
      'Python',
      'TypeScript',
      'JavaScript',
      'Go',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
