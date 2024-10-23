import styled from 'styled-components';

export const RuleTextarea = styled.textarea`
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

export const StartBtn = styled.div`
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
`;
