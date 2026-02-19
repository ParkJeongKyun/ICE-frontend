import type { Metadata } from 'next';
import DocsLayout from '@/layouts/DocsLayout/DocsLayout';
import { type Locale } from '@/locales/routing';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';

  const title = isKo ? '문서' : 'Docs';
  const description = isKo
    ? 'ICE Forensic 사용 가이드 및 참고 자료'
    : 'ICE Forensic — preview, FAQ and use-cases.';

  return {
    title,
    description,
    alternates: {
      canonical: `${DOMAIN}/${locale}/docs`,
      languages: {
        en: `${DOMAIN}/en/docs`,
        ko: `${DOMAIN}/ko/docs`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${locale}/docs`,
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
  };
}

export default function DocsPage() {
  return <DocsLayout />;
}
