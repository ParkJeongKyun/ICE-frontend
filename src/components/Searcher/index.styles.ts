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
  margin-bottom: 10px;
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

// 체크박스
export const SearchCheckBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  input[type='checkbox'] {
    width: 12px;
    height: 12px;
    cursor: pointer;
  }

  &:hover {
    cursor: pointer;
  }

  > span {
    margin-left: 5px;
    font-size: 0.75rem;
    text-align: start;
  }
`;

export const ResultDiv = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: space-between;
`;

export const TextDiv = styled.div`
  display: flex;
  min-height: 25px;
  align-items: center;
  justify-content: center;
`;

export const Result = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  margin: 2px 0px 2px 0px;
  padding: 2px 0px 2px 0px;
`;

export const ButtonDiv = styled.div`
  display: flex;
  min-height: 25px;
  align-items: center;
  justify-content: center;
`;

export const SearchBtn = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  border-radius: 2.5px;
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--main-color);
  border: 1px solid var(--main-line-color);
  &:hover {
    cursor: pointer;
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
  display: ${(props) => (props.$disabled ? `none` : 'inline-flex')};
`;

export const ResetBtn = styled.div`
  display: inline-flex;
  margin: 0px 5px;
  align-items: center;
  justify-content: center;
  svg {
    stroke: var(--main-color);
  }
  &:hover {
    svg {
      stroke: var(--ice-main-color); // 호버 시 아이콘 컬러 변경
    }
  }
`;
