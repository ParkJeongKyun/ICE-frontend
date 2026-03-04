import styled, { css } from 'styled-components';

export const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--main-bg-color);
  color: var(--main-color);
`;

// 1. 헤더: 선을 연하게 빼고 높이를 살짝 키워 개방감 확보
export const TopToolbar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 20px;
  height: 48px;
  background-color: var(--main-bg-color);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* 아주 연한 선 */
  z-index: 100;
  flex-shrink: 0;
  user-select: none;
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
  max-width: 760px; /* 글 읽기 가장 편안한 황금 너비 */
  margin: 0 auto;
  padding: 60px 24px 120px;
  width: 100%;
  box-sizing: border-box;

  .milkdown {
    text-align: left;
    --crepe-font-title: 'Pretendard', -apple-system, sans-serif;
    --crepe-font-default: 'Pretendard', -apple-system, sans-serif;
    --crepe-font-code: 'Menlo', monospace;

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
export const Toast = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 40px;
  right: 40px;
  background-color: var(--main-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--ice-main-color);
  padding: 12px 24px;
  font-family: 'Pretendard', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 30px; /* 캡슐 형태 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: translateY(${({ $show }) => ($show ? '0' : '20px')});
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
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
