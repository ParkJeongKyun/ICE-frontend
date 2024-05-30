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
  padding-top: 4px;
  padding-bottom: 4px;
`;

export const SearchLabel = styled.div`
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
  border-bottom: 1px solid var(--main-line-color);
  box-sizing: border-box;
  font-size: 12px;
  min-height: 25px;
  &:focus,
  &:hover {
    outline: none;
    background-color: var(--main-hover-color_1);
  }
`;

export const ResultDiv = styled.div`
  font-size: 10px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: space-between;
`;

export const TextDiv = styled.div`
  display: flex;
  min-height: 25px;
  align-items: start;
`;

export const Result = styled.div`
  margin: 2px 0px 2px 0px;
  padding: 2px 0px 2px 0px;
`;

export const ButtonDiv = styled.div`
  display: flex;
  min-height: 25px;
  align-items: start;
`;

export const IndexBtn = styled.div<{ $disabled?: boolean }>`
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  border-radius: 2.5px;
  font-weight: 600;
  font-size: 10px;
  color: var(--main-color);
  border: 1px solid var(--main-line-color);
  &:hover {
    cursor: pointer;
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
  display: ${(props) => (props.$disabled ? `none` : 'inline-flex')};
`;
