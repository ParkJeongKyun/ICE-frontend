import styled from 'styled-components';

export const NavigatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;
  padding: 0px;
  height: 100%;
  flex-shrink: 1;
  margin-left: auto;
  min-width: 0;
`;

export const NavigatorInput = styled.input`
  flex: 1;
  min-width: 30px;
  max-width: 120px;
  color: var(--main-color);
  background-color: var(--main-bg-color);
  border: none;
  border-bottom: 1px solid var(--main-line-color);
  box-sizing: border-box;
  font-size: 0.75rem;
  // min-height: 25px;
  &:focus,
  &:hover {
    outline: none;
    background-color: var(--main-hover-color_1);
  }
`;

export const NavigatorButton = styled.div`
  display: inline-flex;
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

export const RadixButton = styled.div`
  display: inline-flex;
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
