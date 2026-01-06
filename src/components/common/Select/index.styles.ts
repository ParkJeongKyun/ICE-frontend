import styled from 'styled-components';

export const SelectContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: stretch;
  overflow: visible;
`;

export const SelectButton = styled.button`
  height: 100%;
  padding: 0 6px;
  background: none;
  border: none;
  color: var(--ice-main-color);
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  user-select: none;

  &:hover {
    background-color: var(--main-hover-color);
  }

  &:active {
    background-color: var(--main-hover-color);
  }
`;

export const SelectDropdown = styled.div`
  position: absolute;
  bottom: calc(100% + 4px);
  right: 0;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100000;
  min-width: 120px;
  overflow: hidden;
`;

export const SelectOption = styled.div<{ $isSelected: boolean }>`
  padding: 6px 10px;
  font-size: 0.7rem;
  color: var(--main-color);
  cursor: pointer;
  background-color: ${({ $isSelected }) =>
    $isSelected ? 'var(--main-hover-color)' : 'transparent'};
  transition: background-color 0.2s;
  user-select: none;

  &:hover {
    background-color: var(--main-hover-color);
    color: var(--ice-main-color);
  }
`;
