import styled from 'styled-components';

export const SearchSelect = styled.select`
  width: 100%;
  outline: none;
  color: var(--main-color);
  border: none;
  background-color: var(--main-bg-color);
  font-size: 0.75rem;
  min-height: 25px;
  border-radius: 5px;
  &:focus,
  &:hover {
    outline: none;
    border: none;
    background-color: var(--main-hover-color_1);
  }
`;

export const SearchDiv = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  gap: 5px;
  justify-content: space-between;
  padding: 2px 0px;
  user-select: none;
`;

export const SearchLabel = styled.div`
  width: 20%;
  font-size: 0.75rem;
  text-align: start;
`;

export const SearchData = styled.div`
  width: 80%;
`;

// 인풋
export const SearchInput = styled.input`
  width: 100%;
  color: var(--main-color);
  background-color: var(--main-bg-color);
  border: none;
  border-bottom: 1px solid var(--main-line-color);
  box-sizing: border-box;
  font-size: 0.75rem;
  min-height: 25px;
  &:focus,
  &:hover {
    outline: none;
    background-color: var(--main-hover-color_1);
  }
`;

export const Result = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--main-color);
  opacity: 0.8;
`;

export const ButtonDiv = styled.div<{ $disabled?: boolean }>`
  display: ${(props) => (props.$disabled ? 'none' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 2px;
  color: var(--main-color);
  cursor: pointer;
  opacity: 0.6;
  font-size: 0.65rem;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 1;
    color: var(--ice-main-color);
  }
`;

export const SearchResultBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0;
  min-height: 20px;
  flex-wrap: wrap;
`;

export const NavigationButtons = styled.div`
  display: flex;
  gap: 0px;
  align-items: center;
  flex-shrink: 0;
`;
