import styled from 'styled-components';

// 메인 레이아웃
export const IceMainLayout = styled.div`
  height: 100vh;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  border: none;
  overflow: hidden; /* 스크롤 숨기기 */
  display: flex;
  flex-direction: column;
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
  height: 24px; /* 기본 푸터 높이 조정 */
  padding: 2px 5px 2px 5px;
  background-color: var(--main-bg-color);
  color: var(--main-line-color);
  border-top: 1px solid var(--main-line-color);
  border-bottom: 1px solid var(--main-line-color);
  font-size: 10px;
`;

// 중간 컨텐츠 레이아웃
export const IceLayout = styled.div`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  flex: 1; /* 중간 컨텐츠 레이아웃이 남은 공간을 차지하도록 */
  overflow: hidden; /* 스크롤 숨기기 */
  display: flex;
`;

// 크기 조절 바
export const Separator = styled.div`
  width: 1px;
  cursor: col-resize;
  background-color: var(--main-line-color);
  position: relative;
  z-index: 1;

  &:hover::before {
    background-color: var(--ice-main-color);
    content: '';
    height: 100%;
    left: -1.5px; /* Adjust this value to center the thicker line */
    position: absolute;
    top: 0;
    width: 5px;
    z-index: -1; /* Ensure the pseudo-element is behind the actual separator */
  }
`;

// 왼쪽 사이드바
export const IceLeftSider = styled.div`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: auto; /* 내용이 넘치면 스크롤 생기도록 */
`;

// 중간 부분
export const IceContent = styled.div`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: auto; /* 내용이 넘치면 스크롤 생기도록 */
  width: 100%;
`;

// 오른쪽 사이드바
export const IceRightSider = styled.div`
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: auto; /* 내용이 넘치면 스크롤 생기도록 */
`;
