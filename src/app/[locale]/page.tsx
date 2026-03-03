import type { Metadata } from 'next';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import DropzoneWrapper from '@/components/DropzoneWrapper/DropzoneWrapper';
import Modal from '@/components/common/Modal/Modal';
import { type Locale } from '@/locales/routing';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.ice-forensic.com';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const isKo = locale === 'ko';

  const title = isKo
    ? '온라인 헥스 뷰어 & 온라인 EXIF 뷰어'
    : 'Online Hex Viewer & Online EXIF Viewer';

  const description = isKo
    ? '설치 없이 웹에서 바로 사용하는 디지털 포렌식 도구. 헥스 뷰어, 파일 헤더 분석, 이미지 EXIF 메타데이터 분석을 지원합니다.'
    : 'Web-based digital forensics tool without installation. Supports Hex Viewer, File Header Analysis, and Image EXIF Metadata Analysis.';

  const keywords = isKo
    ? [
        '헥스 뷰어',
        '디지털 포렌식',
        'EXIF 분석기',
        '무설치 헥스 에디터',
        '파일 분석',
      ]
    : [
        'Hex Viewer',
        'Digital Forensics',
        'EXIF Viewer',
        'Online Hex Editor',
        'File Analysis',
      ];

  return {
    title: title,
    description: description,
    keywords: keywords,
    alternates: {
      canonical: `${DOMAIN}/${locale}`,
      languages: {
        en: `${DOMAIN}/en`,
        ko: `${DOMAIN}/ko`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `${DOMAIN}/${locale}`,
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${DOMAIN}/pullLogo.png`,
          width: 1200,
          height: 630,
          alt: 'ICE Forensic Logo',
        },
      ],
    },
  };
}

import { getMarkdownData } from '@/utils/getMarkdown';

export default async function HomePage(props: Props) {
  const params = await props.params;
  const locale = params.locale;

  const markdownData = getMarkdownData(locale, [
    'about',
    'release',
    'howToUse',
  ]);

  return (
    <>
      <DropzoneWrapper>
        <MainLayout />
        <Modal markdownData={markdownData} />
      </DropzoneWrapper>
    </>
  );
}
