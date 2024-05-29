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
  justify-content: space-between;
`;

export const SearchLabel = styled.div`
  /* font-weight: 600; */
  width: 20%;
  font-size: 12px;
  text-align: start;
`;

export const SearchData = styled.div`
  width: 80%;
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

export const ResultDiv = styled.div`
  font-size: 11px;
`;

export const ButtonDiv = styled.div`
  align-items: end;
`;

export const IndexBtn = styled.div<{ $display: boolean }>`
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 12px;
  color: var(--main-color);
  &:hover {
    cursor: pointer;
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
  display: ${(props) => (props.$display ? `none` : 'inline-flex')};
`;
