'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
  LayoutWrapper,
  TopToolbar,
  ToolbarLeft,
  ToolbarTitle,
  EditorArea,
  MainContainer,
} from './LinkNoteLayout.styles';
import Link from 'next/dist/client/link';
import Logo from '@/components/common/Icons/Logo/Logo';

const LoadingUI = () => {
  const t = useTranslations('linknote');

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
      <EditorArea>
        <MainContainer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '32px', // ★ 변경된 32px 상단 패딩에 정확히 일치시킴
          }}
        >
          <div
            style={{
              padding: '24px', // 애니메이션 박스 패딩 살짝 줄임
              opacity: 0.6,
              animation: 'pulse 1.5s infinite',
              width: '100%',
            }}
          >
            <div
              style={{
                height: '20px',
                background: 'var(--main-line-color)',
                width: '60%',
                marginBottom: '24px',
                borderRadius: '2px',
              }}
            />
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div
                style={{
                  height: '14px',
                  background: 'var(--main-line-color)',
                  width: '100%',
                  borderRadius: '2px',
                }}
              />
              <div
                style={{
                  height: '14px',
                  background: 'var(--main-line-color)',
                  width: '95%',
                  borderRadius: '2px',
                }}
              />
              <div
                style={{
                  height: '14px',
                  background: 'var(--main-line-color)',
                  width: '92%',
                  borderRadius: '2px',
                }}
              />
              <div
                style={{
                  height: '14px',
                  background: 'var(--main-line-color)',
                  width: '92%',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        </MainContainer>
      </EditorArea>
    </LayoutWrapper>
  );
};

const DynamicCrepeEditor = dynamic(
  () => import('@/layouts/LinkNoteLayout/CrepeEditor/CrepeEditor'),
  { ssr: false, loading: () => <LoadingUI /> }
);

export default function LinkNoteLayout() {
  return <DynamicCrepeEditor />;
}
