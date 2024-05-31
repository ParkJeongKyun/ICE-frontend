import styled from 'styled-components';

// 메인 레이아웃
export const IceMainLayout = styled.div<{ $isResizing: boolean }>`
  height: 100vh;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border: none;
  overflow: hidden; /* 스크롤 숨기기 */
  display: flex;
  flex-direction: column;
  /* 리사이즈 중일때는 선택 불가 */
  ${(props) => (props.$isResizing ? 'user-select: none;' : '')}
`;

// 로고
export const LogoDiv = styled.div`
  display: flex;
  align-items: center;
`;

export const LogoImage = styled.img`
  max-height: 18px;
  min-height: 18px;
`;

// 헤더
export const IceHeader = styled.div`
  display: flex;
  gap: 5px;
  /* 위 | 오른쪽 | 아래 | 왼쪽 */
  padding: 0 5px 0 5px;
  height: 27px;
  line-height: 15px;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border-bottom: 1px solid var(--main-line-color);
`;

// 푸터
export const IceFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  overflow: hidden;

  height: 25px; /* 기본 푸터 높이 조정 */
  padding: 0px 5px 0px 5px;
  background-color: var(--main-bg-color);
  border-top: 1px solid var(--main-line-color);
  border-bottom: 1px solid var(--main-line-color);
  font-size: 10px;
`;

export const SelectInfo = styled.div`
  display: flex;
  flex-wrap: nowrap;
  font-size: 12px;
  > hr {
    width: 0px;
    height: 5px;
    padding-left: 2px;
  }
`;

export const IceCopyRight = styled.div`
  color: var(--main-line-color);
`;

// 중간 컨텐츠 레이아웃
export const IceLayout = styled.div`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  flex: 1;
  overflow: hidden; /* 스크롤 숨기기 */
  display: flex;
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
    z-index: -1; /* Ensure the pseudo-element is behind the actual separator */
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
  overflow: hidden; /* 내용이 넘치면 스크롤 생기도록 */
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
  display: block;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
  flex-grow: 1;
`;

// 오른쪽 사이드바
export const IceRightSider = styled.div`
  display: grid;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden; /* 내용이 넘치면 스크롤 생기도록 */
  flex-shrink: 0;
`;
