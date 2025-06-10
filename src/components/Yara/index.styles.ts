import styled from 'styled-components';

export const SearchDiv = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;

  font-size: 0.75rem;
`;

export const RuleTextarea = styled.textarea`
  max-width: 100%;
  min-width: 100%;
  color: var(--main-color);
  background-color: var(--main-bg-color);
  border: none;
  border-bottom: 1px solid var(--main-line-color);
  box-sizing: border-box;
  font-size: 0.75rem;
  min-height: 100px;
  &:focus,
  &:hover {
    outline: none;
    background-color: var(--main-hover-color_1);
  }
`;

export const RuleTag = styled.span`
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  border-radius: 5px;

  font-size: 0.75rem;
  font-weight: 600;

  color: var(--main-color);
  background-color: var(--main-bg-color);

  &:hover {
    outline: none;
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;
