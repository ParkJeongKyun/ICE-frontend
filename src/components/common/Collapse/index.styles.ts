import styled from 'styled-components';

export const CollapseContainer = styled.div``;

export const CollapseHeader = styled.div`
  display: flex;
  padding: 4px 15px 4px 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--main-line-color);
  &:hover {
    background-color: var(--main-hover-color);
  }
`;

export const CollapsIconDiv = styled.div``;

export const Title = styled.div`
  font-weight: 600;
  font-size: 13px;
  margin-left: 10px;
`;

export const CollapseContent = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--main-line-color);
  overflow: hidden; /* 텍스트 오버플로우를 숨김 */
  text-overflow: ellipsis;
`;
