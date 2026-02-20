import type { Metadata } from 'next';
import DocsLayout from '@/layouts/DocsLayout/DocsLayout';
import { getMarkdownData } from '@/utils/getMarkdown';
import { type Locale } from '@/locales/routing';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
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

export default async function DocsPage(props: Props) {
  const params = await props.params;
  const locale = params.locale;

  const markdownData = getMarkdownData(locale, [
    'about',
    'release',
    'update',
    'howToUse',
  ]);

  return <DocsLayout markdownData={markdownData} />;
}
