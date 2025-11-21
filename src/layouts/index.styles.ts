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
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  height: 26px;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border-bottom: 1.5px solid var(--main-line-color);
  overflow: visible;
  position: relative;

  /* 모바일 버전용 */
  ${(props) =>
    props.$isMobile &&
    `
      gap: 6px;
      padding: 2px 6px;
      height: 22px;
    `}
`;

// 진행률 바 (헤더 내부에서 사용)
export const IceHeaderProgressBar = styled.div<{ $progress?: number }>`
  position: absolute;
  left: 0;
  top: 100%; /* 헤더 바로 아래 */
  width: 100%;
  height: 1.5px;
  background: transparent;
  z-index: 1001;
  pointer-events: none;

  /* 실제 진행률 바 */
  & > div {
    height: 100%;
    background: var(--ice-main-color);
    width: 10%;
    transition: none;
    ${({ $progress }) =>
      typeof $progress !== 'number'
        ? `
      animation: loading-bar-move 4s linear infinite;
    `
        : ''}
  }

  @keyframes loading-bar-move {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(100vw - 80px));
    }
  }
`;

// 푸터
export const IceFooter = styled.div<{ $isMobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  overflow: hidden;
  white-space: nowrap;

  height: 25px;
  padding: 0px 5px 0px 5px;
  background-color: var(--main-bg-color);
  border-top: 1px solid var(--main-line-color);
  border-bottom: 1px solid var(--main-line-color);
  font-size: 0.6rem;

  /* 모바일 버전용 */
  ${(props) =>
    props.$isMobile &&
    `
      overflow-x:auto
    `}
`;

export const ProcessInfo = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
`;

export const Spinner = styled.div`
  border: 2px solid var(--main-line-color);
  border-top: 2px solid var(--ice-main-color);
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const ProcessMsg = styled.span`
  margin-left: 5px;
  margin-right: 5px;
  position: relative;

  &::after {
    content: '';
    animation: dots 1.5s steps(1, end) infinite;
  }

  @keyframes dots {
    0%,
    20% {
      content: '';
    }
    40% {
      content: '.';
    }
    60% {
      content: '..';
    }
    80%,
    100% {
      content: '...';
    }
  }
`;

export const SelectInfo = styled.div`
  display: flex;
  flex-wrap: nowrap;
  font-size: 0.75rem;
  font-weight: 600;
  > div {
    text-align: start;
    min-width: 170px;
    margin-left: 10px;
    padding-right: 10px;
    border-right: 1px solid var(--main-line-color);
  }
  > div:nth-child(2) {
    min-width: 250px;
  }
`;

export const IceCopyRight = styled.div`
  margin: 0px 10px;
  color: var(--main-color_1);
  font-weight: 600;
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
  height: 40%;
  border-top: 1px solid var(--main-line-color);
`;

// 셀렉트 박스 스타일
export const IceSelect = styled.select`
  width: 100px;
  outline: none;
  color: var(--main-color);
  border: none;
  background-color: var(--main-bg-color);
  font-size: 0.75rem;
  min-height: 25px;
  border-radius: 5px;
  &:focus,
  &:hover {
    outline: none;
    border: none;
    background-color: var(--main-hover-color_1);
  }
`;

export const IceFooterRight = styled.div`
  margin: 0px 10px;
  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 0.75rem;
  font-weight: 600;
`;
