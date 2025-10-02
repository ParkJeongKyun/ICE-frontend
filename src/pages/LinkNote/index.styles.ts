import styled from 'styled-components';

export const MainContainer = styled.div``;

export const ButtonZone = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

export const ToggleButton = styled.button<{ isReadOnly: boolean }>`
  padding: 6px 6px;
  background-color: ${({ isReadOnly }) => (isReadOnly ? '#4CAF50' : '#2196F3')};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;
