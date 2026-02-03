import type { Metadata } from 'next';
import LinkNoteLayout from '@/layouts/LinkNoteLayout/LinkNoteLayout';
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
    ? '링크 노트 - 온라인 메모장 | ICE Forensic'
    : 'Link Note - Online Note | ICE Forensic';

  const description = isKo
    ? 'URL을 통해 공유할 수 있는 간단한 온라인 메모장. 서버 저장 없이 클라이언트에서만 처리됩니다.'
    : 'Simple online note that can be shared via URL. No server storage, everything is processed client-side.';

  return {
    title: title,
    description: description,
    keywords: isKo
      ? [
          '온라인 메모장',
          '링크 노트',
          '무료 메모',
          'URL 공유',
          '클라이언트 메모',
        ]
      : [
          'Online Note',
          'Link Note',
          'Free Note',
          'URL Sharing',
          'Client-side Note',
        ],
    alternates: {
      canonical: `${DOMAIN}/${locale}/linknote`,
    },
    openGraph: {
      title: title,
      description: description,
      url: `${DOMAIN}/${locale}/linknote`,
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${DOMAIN}/pullLogo.png`,
          width: 1200,
          height: 630,
          alt: 'ICE Forensic - Link Note',
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

export default function LinkNotePage() {
  return <LinkNoteLayout />;
}
