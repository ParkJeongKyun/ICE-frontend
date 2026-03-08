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
import { Link } from '@/locales/routing';
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
            paddingTop: '32px',
          }}
        >
          {/* LCP 앵커: 실제 텍스트를 DOM에 놓아 구글 봇이 콘텐츠를 즉시 인식하게 함 */}
          <h1
            style={{
              position: 'absolute',
              top: '24px',
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'var(--main-color)',
              opacity: 0.2,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {t('appName')}
          </h1>
          <div
            style={{
              padding: '24px',
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

const DynamicTipTapEditor = dynamic(
  () => import('@/layouts/LinkNoteLayout/TipTapEditor/TipTapEditor'),
  { ssr: false, loading: () => <LoadingUI /> }
);

export default function LinkNoteLayout() {
  return <DynamicTipTapEditor />;
}
