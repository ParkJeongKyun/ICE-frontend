import styled from 'styled-components';

export const CollapseContainer = styled.div``;

export const CollapseHeader = styled.div`
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0px 15px 0px 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--main-line-color);
  &:hover {
    background-color: var(--main-hover-color);
  }
  user-select: none;
`;

export const CollapsIconDiv = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
  margin-left: 10px;
  overflow: hidden;
  white-space: nowrap;
  word-break: break-all;
  text-overflow: ellipsis;
`;

export const CollapseContent = styled.div<{
  $removePadding?: boolean;
}>`
  padding: ${({ $removePadding }) => ($removePadding ? '0' : '10px')};
  border-bottom: 1px solid var(--main-line-color);
  overflow: hidden;
  text-overflow: ellipsis;
`;
