import styled from 'styled-components';

// 메인 레이아웃
export const IceMainLayout = styled.div<{ $isResizing: boolean }>`
  width: 100%;
  height: 100%;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border: none;
  overflow: hidden; /* 스크롤 숨기기 */
  display: flex;
  flex-direction: column;
  /* 리사이즈 중일때는 선택 불가 */
  ${(props) => (props.$isResizing ? 'user-select: none;' : '')}
`;

// 헤더
export const IceHeader = styled.div<{
  $isMobile?: boolean;
  $isProcessing?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 8px;
  height: 26px;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border-bottom: 1.5px solid var(--main-line-color);
  overflow: visible;
  position: relative;
  user-select: none;

  /* Processing shimmer effect on bottom border (overlayed, keeping border visible) */
  ${(props) =>
    props.$isProcessing &&
    `
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      height: 1.5px;
      width: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 20%, var(--ice-main-color) 50%, rgba(255,255,255,0.05) 80%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 2.5s linear infinite;
      pointer-events: none;
      z-index: 802;
      mix-blend-mode: screen; /* blend with existing border */
    }

    @keyframes shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }
  `}

  /* 모바일 버전용 */
  ${(props) =>
    props.$isMobile &&
    `
      gap: 4px;
      padding: 2px 6px;
    `}
`;

export const IceHeaderLeftSider = styled.div<{
  $isMobile?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;

  /* 모바일 버전용 */
  ${(props) =>
    props.$isMobile &&
    `
      gap: 4px;
    `}
`;

// 진행률 바 (헤더 내부에서 사용)
export const IceHeaderProgressBar = styled.div<{ $progress: number; $isProcessing: boolean }>`
  position: absolute;
  left: 0;
  top: 100%; /* 헤더 바로 아래 */
  width: 100%;
  height: 1.5px;
  background: transparent;
  z-index: 800;
  pointer-events: none;
  opacity: ${({ $isProcessing }) => ($isProcessing ? 1 : 0)};
  transition: opacity 0.2s ease;

  /* 실제 진행률 바 */
  & > div {
    height: 100%;
    background: var(--ice-main-color);
    width: ${({ $progress }) => `${Math.max($progress, 0)}%`};
    transition: width 0.3s ease;
  }
`;

// 푸터
export const IceFooter = styled.div<{ $isMobile?: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 8px;
  height: 24px;
  padding: 0px 0px 0px 8px;
  background-color: var(--main-bg-color);
  border-top: 1px solid var(--main-line-color);
  font-size: 0.7rem;
  overflow: visible;
  user-select: none;
  position: relative;

  ${(props) =>
    props.$isMobile &&
    `
      padding: 0px 6px;
      font-size: 0.65rem;
      gap: 4px;
    `}
`;

export const ProcessInfo = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
`;

export const SelectInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  overflow-x: auto;
  flex: 1;
  min-width: 0;

  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  > div {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
`;

export const SelectLabel = styled.span`
  color: var(--main-color);
  opacity: 0.8;
`;

export const SelectValue = styled.span`
  color: var(--ice-main-color);
  font-weight: 600;

  span {
    opacity: 0.6;
    font-weight: 500;
  }
`;

export const IceCopyRight = styled.div`
  color: var(--main-color);
  opacity: 0.6;
  font-weight: 500;
  font-size: 0.65rem;
  white-space: nowrap;
`;

// 중간 컨텐츠 레이아웃
export const IceLayout = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden; /* 스크롤 숨기기 */
`;

// 크기 조절 바
export const Separator = styled.div<{
  $reverse?: boolean;
  $isResizing: boolean;
}>`
  width: 1px;
  cursor: col-resize;
  background-color: var(--main-line-color);
  position: relative;
  z-index: 1;

  &:hover::before {
    background-color: var(--ice-main-color);
    content: '';
    height: 100%;
    ${(props) => (props.$reverse ? 'right: 1.5px;' : 'left: -1.5px;')};
    position: absolute;
    top: 0;
    width: 5px;
    z-index: -1;
  }

  /* 리사이즈 중일때 스타일 */
  ${(props) =>
    props.$isResizing &&
    `
    &::before {
      background-color: var(--ice-main-color);
      content: '';
      height: 100%;
      ${props.$reverse ? 'right: 1.5px;' : 'left: -1.5px;'};
      position: absolute;
      top: 0;
      width: 5px;
      z-index: -1; /* Ensure the pseudo-element is behind the actual separator */
    }
  `}
`;

// 왼쪽 사이드바
export const IceLeftSider = styled.div`
  display: grid;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
  overflow-y: auto;
  flex-shrink: 0;
`;

// 크기조절을 위한 div
export const FlexGrow = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

// 중간 부분
export const IceContent = styled.div`
  display: flex;
  flex: 1;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
`;

// 오른쪽 사이드바
export const IceRightSider = styled.div`
  display: grid;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: auto;
  flex-shrink: 0;
`;

// 모바일 레이아웃
export const IceMobileLayout = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden; /* 스크롤 숨기기 */
`;

// 모바일
export const IceMobileContent = styled.div`
  display: flex;
  flex-grow: 1;
  background-color: var(--main-bg-color);
  color: var(--main-color);
`;

// 모바일
export const IceMobileBottom = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: auto;
  height: 70%;
  border-top: 1px solid var(--main-line-color);
`;

export const IceFooterRight = styled.div`
  display: flex;
  align-items: stretch;
  font-size: 0.7rem;
  font-weight: 500;
  flex-shrink: 0;
  position: relative;
`;
