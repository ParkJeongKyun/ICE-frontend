import styled, { css } from 'styled-components';

export const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--main-bg-color);
  color: var(--main-color);
`;

// 1. 헤더: 전체화면 시 CSS 애니메이션으로 부드럽게 숨김
export const TopToolbar = styled.header<{ $isFullscreen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0px 10px;
  background-color: var(--main-bg-color);
  border-bottom: 1px solid var(--main-line-color);
  z-index: 100;
  flex-shrink: 0;
  user-select: none;
  overflow: hidden;

  /* ★ CSS 애니메이션으로 전체화면 상태 제어 (DOM 유지, Reflow 방지) */
  height: ${({ $isFullscreen }) => ($isFullscreen ? '0' : '40px')};
  opacity: ${({ $isFullscreen }) => ($isFullscreen ? '0' : '1')};
  transform: translateY(
    ${({ $isFullscreen }) => ($isFullscreen ? '-10px' : '0')}
  );
  pointer-events: ${({ $isFullscreen }) => ($isFullscreen ? 'none' : 'auto')};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
`;

export const ToolbarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 700;
  font-size: 8px;
  line-height: 1.5;
  flex-shrink: 0;
  cursor: default;
  transition: opacity 0.2s;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: var(--ice-main-color);
  }

  &::after {
    content: '';
    display: block;
    width: 1px;
    height: 14px;
    background-color: var(--main-line-color);
    margin-left: 8px;
  }
`;

export const LogoButton = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const ToolbarStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Pretendard', sans-serif;
  font-size: 0.8rem;
  color: var(--main-color);
  opacity: 0.5;
  min-width: 0;

  span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

// 2. 미니멀 고스트 버튼 (Notion 스타일)
const GhostButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--main-color);
  font-family: 'Pretendard', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
    opacity: 1;
    color: var(--ice-main-color) !important;
    fill: var(--ice-main-color) !important;
    stroke: var(--ice-main-color) !important;
  }

  &:hover {
    background-color: rgba(
      255,
      255,
      255,
      0.08
    ); /* 마우스 올릴 때만 은은한 배경 */
    color: var(--ice-main-color);
    svg {
      opacity: 1;
      color: var(--ice-main-color);
    }
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    span {
      display: none;
    }
  }
`;

export const ToggleButton = styled.button<{ $isReadOnly: boolean }>`
  ${GhostButton}
  /* 읽기/쓰기 모드에 따라 미세한 색상 포인트 */
  ${({ $isReadOnly }) =>
    !$isReadOnly &&
    `
    background-color: rgba(0, 180, 255, 0.05);
    color: var(--ice-main-color);
    svg { opacity: 1; color: var(--ice-main-color); }
  `}
`;

export const ShareButton = styled.button`
  ${GhostButton}
`;

export const EditorArea = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  width: 100%;

  &::-webkit-scrollbar {
    display: block !important;
    width: 10px !important;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-color);
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--scrollbar-color-hover);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

// 3. 종이(Paper) 감성의 에디터 컨테이너
export const MainContainer = styled.div`
  max-width: 760px;
  margin: 0 auto;
  /* ★ 상하 패딩을 절반 수준으로 대폭 축소하여 화면을 넓게 씁니다 */
  padding: 32px 24px 64px;
  width: 100%;
  box-sizing: border-box;

  .milkdown {
    text-align: left;
    --crepe-font-title: 'Pretendard', -apple-system, sans-serif;
    --crepe-font-default: 'Pretendard', -apple-system, sans-serif;
    --crepe-font-code: 'Menlo', monospace;

    /* ★ 1. 실제 DOM 기반 업로드 UI 완전 제거 */
    .placeholder label.uploader,
    .placeholder input[type='file'],
    .placeholder span.text {
      display: none !important;
      pointer-events: none !important;
    }
    /* milkdown-image-block 커스텀 엘리먼트 자체를 숨겨 빈 껍데기까지 제거 */
    milkdown-image-block {
      display: none !important;
    }

    /* ★ 2. 슬래시(/) 및 플러스(+) 메뉴에서 '이미지' 아이템 숨김 */
    [role='menuitem'][data-id='image'],
    .milkdown-slash-menu [data-id='image'] {
      display: none !important;
    }

    .editor {
      padding: 0;

      p {
        font-size: 1.05rem; /* 시원시원한 본문 크기 */
        line-height: 1.7; /* 넉넉한 줄간격 */
        color: rgba(255, 255, 255, 0.85); /* 눈이 편안한 텍스트 컬러 */
        word-break: break-word;
      }

      .heading {
        color: var(--ice-main-color);
        font-weight: 700;
        letter-spacing: -0.5px;
        margin-top: 1.5em;
      }

      /* 코드블록도 깔끔하게 */
      .milkdown-code-block {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-size: 0.9rem;
      }
    }
  }
`;

// 4. 모서리가 둥근 세련된 토스트
// ★ 플로팅 닫기 버튼 (우측 하단에 떠 있는 원형 버튼)
export const FloatingButton = styled.button<{ $show: boolean }>`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--main-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--main-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;

  /* 부드러운 애니메이션 적용 */
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transform: translateY(${({ $show }) => ($show ? '0' : '20px')})
    scale(${({ $show }) => ($show ? 1 : 0.95)});
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: var(--ice-main-color);
    border-color: var(--ice-main-color);
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    bottom: 24px;
    right: 24px;
  }
`;

export const Toast = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 40px;
  /* ★ 토스트를 하단 중앙으로 이동시켜 플로팅 버튼과 겹치지 않게 수정 */
  left: 50%;
  transform: translateX(-50%)
    translateY(${({ $show }) => ($show ? '0' : '20px')});
  background-color: var(--main-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--ice-main-color);
  padding: 12px 24px;
  font-family: 'Pretendard', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
`;

export const BottomBar = styled.div<{
  $warn: boolean;
  $isFullscreen?: boolean;
}>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 0 14px;
  border-top: 1px solid var(--main-line-color);
  background-color: var(--main-bg-color);
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $warn }) => ($warn ? '#ff5555' : 'var(--main-color)')};
  user-select: none;
  overflow: hidden;

  height: ${({ $isFullscreen }) => ($isFullscreen ? '0' : '32px')};
  opacity: ${({ $warn, $isFullscreen }) =>
    $isFullscreen ? 0 : $warn ? 1 : 0.55};
  transform: translateY(
    ${({ $isFullscreen }) => ($isFullscreen ? '10px' : '0')}
  );
  pointer-events: ${({ $isFullscreen }) => ($isFullscreen ? 'none' : 'auto')};
  transition:
    height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s;
`;

export const BottomBarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--main-color);
  cursor: pointer;
  opacity: 0.55;
  transition:
    opacity 0.15s,
    color 0.15s;
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    opacity: 1;
    color: var(--ice-main-color);
  }
`;

export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  color: var(--ice-main-color);
  animation: pulse 1.5s infinite;

  svg {
    width: 14px;
    height: 14px;
    color: var(--ice-main-color);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
`;
