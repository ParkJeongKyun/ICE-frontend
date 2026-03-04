'use client';

import dynamic from 'next/dynamic';
import {
  LayoutWrapper,
  TopToolbar,
  ToolbarLeft,
  ToolbarTitle,
  EditorArea,
  MainContainer,
} from './LinkNoteLayout.styles';
import Logo from '@/components/common/Icons/Logo/Logo';

const LoadingUI = () => (
  <LayoutWrapper>
    <TopToolbar>
      <ToolbarLeft>
        <ToolbarTitle onClick={() => (window.location.href = '/')}>
          <Logo showText />
          LinkNote
        </ToolbarTitle>
      </ToolbarLeft>
    </TopToolbar>
    <EditorArea>
      <MainContainer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '60px',
        }}
      >
        <div
          style={{
            padding: '40px',
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
          </div>
        </div>
      </MainContainer>
    </EditorArea>
  </LayoutWrapper>
);

const DynamicCrepeEditor = dynamic(
  () => import('@/components/CrepeEditor/CrepeEditor'),
  { ssr: false, loading: () => <LoadingUI /> }
);

export default function LinkNoteLayout() {
  return <DynamicCrepeEditor />;
}
