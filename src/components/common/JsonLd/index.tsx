'use client';

interface JsonLdProps {
  locale?: string;
}

export default function JsonLd({ locale = 'en' }: JsonLdProps) {
  const isKo = locale === 'ko';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ICE Forensic',
    url: 'https://www.ice-forensic.com',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    description: isKo
      ? '웹 기반 디지털 포렌식 도구'
      : 'Web-based Digital Forensic Tool',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'Park Jeong Kyun',
    },
    inLanguage: isKo ? 'ko' : 'en',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
