import styled from 'styled-components';

// 스타일드 컴포넌트
export const TabWindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const TabsContainer = styled.div<{ $empty: boolean }>`
  display: flex;
  align-items: center;
  overflow-x: auto;
  width: 100%;
  border-bottom: ${(props) =>
    props.$empty ? 'none' : '1px solid var(--main-line-color)'};

  /* 스크롤 디자인 */
  // Chrome, Safari, Edge, Opera
  &::-webkit-scrollbar {
    display: block !important;
    width: 5px; /* 스크롤바 너비 */
    height: 5px; /* Scrollbar 높이 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3); /* 스크롤바 색상 */
    &:hover {
      /* 마우스 호버시 스크롤바 색상 */
      background-color: var(--main-hover-line-color);
    }
  }
  /* 스크롤 디자인 */
`;

export const Tab = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 6px 5px 6px 10px;
  border-right: 1px solid var(--main-line-color);
  cursor: pointer;
  border-bottom: ${(props) =>
    props.$active ? '2px solid var(--ice-main-color)' : 'none'};
  color: ${(props) =>
    props.$active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
    ${(props) =>
      props.$active
        ? ''
        : 'border-bottom: 2px solid var(--main-hover-line-color);'};
    svg {
      stroke: var(--main-hover-line-color);
    }
  }
  white-space: nowrap; /* 줄 바꿈 방지 */
`;

export const CloseBtn = styled.div<{ $active: boolean }>`
  margin-left: 5px;
  display: flex;
  align-items: center;
  svg {
    stroke: ${(props) => (props.$active ? 'var(--main-line-color)' : 'none')};
  }
  &:hover {
    svg {
      stroke: var(--ice-main-color); // 호버 시 아이콘 컬러 변경
    }
  }
`;

export const TabContentContainer = styled.div`
  flex-grow: 1; // 남는 부분을 전부 차지
  padding: 0px;
  overflow: hidden; // 콘텐츠가 많을 경우 스크롤

  @media (max-width: 900px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;
