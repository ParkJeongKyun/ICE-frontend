import type { Metadata } from 'next';
import LinkNoteLayout from '@/layouts/LinkNoteLayout/LinkNoteLayout';
import { type Locale } from '@/locales/routing';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const isKo = locale === 'ko';

  const title = isKo
    ? 'ICE 링크 노트 - URL 온라인 메모장'
    : 'ICE LinkNote - URL Online Notepad';

  const description = isKo
    ? '서버 저장 없이 오직 URL로만 데이터를 압축하여 공유하는 클라이언트 기반 무료 마크다운 메모장입니다.'
    : 'A fully client-side, free Markdown notepad that compresses and shares data exclusively via URL without server storage.';

  const keywords = isKo
    ? [
        '온라인 메모장',
        '링크 노트',
        '무료 메모',
        'URL 공유',
        '마크다운 에디터',
        '무설치 메모장',
      ]
    : [
        'Online Note',
        'Link Note',
        'Free Note',
        'URL Sharing',
        'Markdown Editor',
        'Notepad',
      ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${DOMAIN}/${locale}/linknote`,
      languages: {
        en: `${DOMAIN}/en/linknote`,
        ko: `${DOMAIN}/ko/linknote`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${locale}/linknote`,
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
      siteName: 'ICE Forensic',
      images: [
        {
          url: `${DOMAIN}/pullLogo.png`,
          width: 1200,
          height: 630,
          alt: 'ICE LinkNote Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${DOMAIN}/pullLogo.png`],
    },
  };
}

export default async function LinkNotePage(props: Props) {
  const { locale } = await props.params;
  const isKo = locale === 'ko';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isKo ? 'ICE 링크 노트 (LinkNote)' : 'ICE LinkNote',
    url: `${DOMAIN}/${locale}/linknote`,
    description: isKo
      ? '서버 저장 없이 URL로 공유하는 마크다운 온라인 메모장'
      : 'Markdown online notepad shared via URL without server storage',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Supports HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 시각적으로 숨겨진 시맨틱 마크업: 봇이 JS 없이도 페이지 주제를 파악하도록 */}
      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <h1>
          {isKo
            ? 'ICE 링크 노트 (LinkNote) - URL 온라인 메모장'
            : 'ICE LinkNote - Online URL Notepad'}
        </h1>
        <p>
          {isKo
            ? 'ICE LinkNote는 서버에 어떠한 데이터도 남기지 않고, 작성하신 텍스트를 pako(deflate)로 압축하여 URL 자체에 저장하는 무설치 마크다운 메모장입니다.'
            : 'ICE LinkNote is an installation-free Markdown notepad that leaves no data on the server, compressing your text with pako (deflate) and storing it directly in the URL.'}
        </p>
        <h2>{isKo ? '주요 기능 및 장점' : 'Key Features and Benefits'}</h2>
        <ul>
          <li>
            {isKo
              ? '강력한 마크다운(Markdown) 에디터 지원'
              : 'Powerful Markdown editor support'}
          </li>
          <li>
            {isKo
              ? '서버 저장소(DB)를 사용하지 않는 프라이버시 보호'
              : 'Privacy protection with no server database'}
          </li>
          <li>
            {isKo
              ? 'URL 복사만으로 즉시 공유 가능한 편의성'
              : 'Instant sharing convenience just by copying the URL'}
          </li>
          <li>
            {isKo
              ? '설치 및 회원가입이 필요 없는 무료 툴'
              : 'Free tool requiring no installation or sign-up'}
          </li>
        </ul>
      </div>

      <LinkNoteLayout />
    </>
  );
}
