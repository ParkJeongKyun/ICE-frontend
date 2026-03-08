'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutWrapper,
  TopToolbar,
  ToolbarLeft,
  ToolbarTitle,
  EditorArea,
  MainContainer,
} from './LinkNoteLayout.styles';
import { Link } from '@/locales/routing';
import Logo from '@/components/common/Icons/Logo/Logo';

const LoadingUI = () => {
  const t = useTranslations('linknote');

  const skeletonSvg = `<svg width="800" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="250" height="24" rx="4" fill="#888888" opacity="0.2"/><rect x="0" y="50" width="800" height="14" rx="4" fill="#888888" opacity="0.1"/><rect x="0" y="80" width="720" height="14" rx="4" fill="#888888" opacity="0.1"/><rect x="0" y="110" width="760" height="14" rx="4" fill="#888888" opacity="0.1"/><rect x="0" y="140" width="600" height="14" rx="4" fill="#888888" opacity="0.1"/></svg>`;
  const skeletonDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(skeletonSvg)}`;

  return (
    <LayoutWrapper>
      <TopToolbar>
        <ToolbarLeft>
          <ToolbarTitle>
            <Link href="/" aria-label={t('homepage')}>
              <Logo showText />
            </Link>
            {t('appName')}
          </ToolbarTitle>
        </ToolbarLeft>
      </TopToolbar>
      <EditorArea as="main">
        <MainContainer
          style={{
            paddingTop: '32px',
          }}
        >
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--main-color)',
              marginBottom: '24px',
            }}
          >
            {t('appName')}
          </h1>
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              height: '300px',
              backgroundImage: `url("${skeletonDataUrl}")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left',
              backgroundSize: '100% auto',
            }}
          />
        </MainContainer>
      </EditorArea>
    </LayoutWrapper>
  );
};

const DynamicTipTapEditor = dynamic(
  () => import('@/layouts/LinkNoteLayout/TipTapEditor/TipTapEditor'),
  { ssr: false, loading: () => <LoadingUI /> }
);

export default function LinkNoteLayout() {
  const [hasClient, setHasClient] = useState(false);

  useEffect(() => {
    setHasClient(true);
  }, []);

  // 서버 렌더링 & 초기 하이드레이션: LoadingUI가 SSR HTML에 포함됨 → LCP 앵커 확보
  if (!hasClient) {
    return <LoadingUI />;
  }

  // 클라이언트 마운트 후: DynamicTipTapEditor 로딩 중에도 LoadingUI로 fallback
  return <DynamicTipTapEditor />;
}
