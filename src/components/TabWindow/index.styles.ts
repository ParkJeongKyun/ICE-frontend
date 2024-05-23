import styled from 'styled-components';

// 스타일드 컴포넌트
export const TabWindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const TabsContainer = styled.div<{ $empty: boolean }>`
  display: flex;
  overflow-x: auto;
  border-bottom: ${(props) =>
    props.$empty ? 'none' : '1px solid var(--main-line-color)'};
`;

export const Tab = styled.div<{ $active: boolean }>`
  display: flex;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px 5px 15px;
  border-right: 1px solid var(--main-line-color);
  /* height: 12px; */
  cursor: pointer;
  border-bottom: ${(props) =>
    props.$active ? '2px solid var(--ice-main-color)' : 'none'};
  color: ${(props) =>
    props.$active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
  /* 텍스트가 너무 길어질 때 ...으로 대체되도록 설정 */
  white-space: nowrap; /* 줄 바꿈 방지 */
`;

export const CloseBtn = styled.div`
  margin-left: 5px;
  display: flex;
  align-items: center;
  &:hover {
    svg {
      stroke: var(--ice-main-color); // 호버 시 아이콘 컬러 변경
    }
  }
`;

export const TabContentContainer = styled.div`
  flex-grow: 1; // 남는 부분을 전부 차지
  padding: 0px;
  overflow: auto; // 콘텐츠가 많을 경우 스크롤
  min-width: 570px;
`;
