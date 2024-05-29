import styled from 'styled-components';

export const ContainerDiv = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
`;

export const SearchDiv = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  gap: 5px;
`;

export const SearchLabel = styled.div`
  /* font-weight: 600; */
  font-size: 12px;
`;

export const SearchData = styled.div`
  flex-grow: 1;
`;

export const SearchInput = styled.input`
  width: 100%;
  color: var(--main-color);
  background-color: var(--main-bg-color);
  border: none;
  border: 1px solid var(--main-line-color);
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  &:focus,
  &:hover {
    outline: 1.5px solid var(--main-hover-line-color);
  }
`;
