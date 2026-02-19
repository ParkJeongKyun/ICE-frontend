import { type Locale } from '@/locales/routing';

interface JsonLdProps {
  locale: Locale;
}

export default function JsonLd({ locale }: JsonLdProps) {
  const isKo = locale === 'ko';
  const DOMAIN = 'https://www.ice-forensic.com';

  // 1. 현재 언어 경로를 포함한 URL 생성
  const currentUrl = `${DOMAIN}/${locale}`;

  // ID값은 전역적인 식별자이므로 그대로 두거나 도메인 루트를 기준으로 하는 것이 일반적입니다.
  const PERSON_ID = `${DOMAIN}/#person`;
  const ORG_ID = `${DOMAIN}/#organization`;

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Park Jeong Kyun',
    birthDate: '2001-02-23',
    nationality: 'South Korea',
    email: 'dbzoseh84@gmail.com',
    jobTitle: [
      'Digital Forensics Expert',
      'Security Engineer',
      'Full-Stack Developer',
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

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'ICE Forensic',
    // 2. 조직의 URL도 현재 언어 페이지를 가리키도록 수정
    url: currentUrl,
    logo: `${DOMAIN}/logo.png`,
    description: isKo
      ? '웹 기반 디지털 포렌식 도구'
      : 'Web-based Digital Forensic Tool',
    inLanguage: isKo ? 'ko' : 'en',
    sameAs: ['https://github.com/ParkJeongKyun/ICE-frontend'],
    founder: { '@id': PERSON_ID },
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
    // 3. 애플리케이션의 공식 URL을 현재 언어 경로로 일치 (중요)
    url: currentUrl,
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
    creator: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: isKo ? 'ko' : 'en',
  };

  const combinedJsonLd = [
    personJsonLd,
    organizationJsonLd,
    webApplicationJsonLd,
  ];

  return (
    <script
      type="application/ld+json"
      // JSON 내부에 멀티바이트 문자(한글)가 있을 수 있으므로 안정적인 문자열화
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedJsonLd) }}
    />
  );
}
