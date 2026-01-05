import styled, { keyframes } from 'styled-components';
import { MessageType } from '@/contexts/MessageContext';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Toast 스타일
export const ToastContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 10000;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};

  @media (max-width: 768px) {
    top: auto;
    bottom: 80px;
    right: 10px;
    left: 10px;
  }
`;

export const ToastBox = styled.div<{ $type: MessageType; $isOpen: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 500px;
  padding: 16px;
  background-color: var(--main-bg-color);
  border: 2px solid ${({ $type }) => getTypeColor($type)};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${({ $isOpen }) => ($isOpen ? slideIn : slideOut)} 0.3s ease-out;
  user-select: none;

  @media (max-width: 768px) {
    min-width: auto;
    max-width: 100%;
    padding: 12px;
    gap: 10px;
  }
`;

export const ToastIcon = styled.div<{ $type: MessageType }>`
  color: ${({ $type }) => getTypeColor($type)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ToastContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ToastTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const ToastText = styled.div`
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--main-color);
  white-space: pre-wrap;
  word-break: break-word;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  transition: color 0.2s;
  flex-shrink: 0;

  &:hover {
    color: var(--ice-main-color);
  }
`;

function getTypeColor(type: MessageType): string {
  switch (type) {
    case 'error':
      return '#dc3545';
    case 'warning':
      return '#ffc107';
    case 'success':
      return '#28a745';
    default:
      return 'var(--ice-main-color)';
  }
}
