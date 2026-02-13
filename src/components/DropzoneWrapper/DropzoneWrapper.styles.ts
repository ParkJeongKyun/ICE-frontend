import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const DropzoneRoot = styled.div`
  width: 100%;
  height: 100%;
`;

export const DragOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(96, 200, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 3px dashed var(--ice-main-color);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  cursor: pointer;
  animation: ${fadeIn} 0.15s ease-out;
`;

export const DragIconContainer = styled.div`
  pointer-events: none;

  svg {
    display: block;
    stroke: var(--ice-main-color);
  }
`;

export const DragMessage = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ice-main-color);
  pointer-events: none;
`;
