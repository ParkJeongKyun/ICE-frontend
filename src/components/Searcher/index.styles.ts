import styled from 'styled-components';

export const ContainerDiv = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
`;

export const SearchDiv = styled.div`
  display: flex;
  gap: 5px;
`;

export const SearchLabel = styled.div`
  font-weight: 600;
  font-size: 12px;
  margin-right: 10px;
`;

export const SearchInput = styled.input`
  flex-grow: 1;
  color: var(--main-color);
  background-color: var(--main-bg-color);
  border: none;
  border: 1px solid var(--main-line-color);
  &:focus,
  &:hover {
    outline: 1.5px solid var(--main-hover-line-color);
  }
`;
