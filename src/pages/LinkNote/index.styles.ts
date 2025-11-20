import styled from 'styled-components';

export const MainContainer = styled.div``;

export const ButtonZone = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

export const ToggleButton = styled.button<{ isReadOnly: boolean }>`
  padding: 8px 8px;
  background-color: transparent;
  color: ${({ isReadOnly }) => (isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
  border: 1.5px solid ${({ isReadOnly }) => (isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    stroke: ${({ isReadOnly }) => (isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
    fill: ${({ isReadOnly }) => (isReadOnly ? 'var(--ice-main-color_2)' : 'var(--ice-main-color)')};
  }

  &:hover {
    background-color: var(--main-hover-color);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ShareButton = styled.button`
  padding: 8px 8px;
  background-color: transparent;
  color: var(--ice-main-color);
  border: 1.5px solid var(--ice-main-color);
  border-radius: 8px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;

  svg {
    stroke: var(--ice-main-color);
    fill: var(--ice-main-color);
  }

  &:hover {
    background-color: var(--main-hover-color);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Toast = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 80px;
  right: 20px;
  background-color: var(--main-hover-color);
  color: var(--main-color);
  padding: 12px 20px;
  border-radius: 8px;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  transition: opacity 0.3s, visibility 0.3s;
  z-index: 1001;
`;

export const ErrorMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--ice-main-color_1);
  color: var(--main-color);
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 1002;
`;

export const StatusIndicator = styled.div<{ saving: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 12px;
  color: ${({ saving }) => (saving ? 'var(--ice-main-color_3)' : 'var(--ice-main-color_2)')};
  padding: 4px 8px;
  z-index: 999;
  transition: opacity 0.3s ease;
  font-weight: 500;
  pointer-events: none;
`;

export const LastModifiedTime = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  font-size: 11px;
  color: var(--main-color_1);
  padding: 4px 8px;
  z-index: 999;
  opacity: 0.7;
  font-weight: 400;
  pointer-events: none;
`;
