import styled from 'styled-components';
import { MessageType } from '@/contexts/MessageContext';

export const MessageModalContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 10000;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};

  @media (max-width: 768px) {
    bottom: 80px;
    right: 10px;
    left: 10px;
  }
`;

export const MessageBox = styled.div<{ $type: MessageType }>`
  background-color: var(--main-bg-color);
  border: 1px solid ${({ $type }) => getTypeColor($type)};
  border-left: 4px solid ${({ $type }) => getTypeColor($type)};
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  @media (max-width: 768px) {
    min-width: auto;
    max-width: none;
    padding: 12px;
  }
`;

export const MessageIcon = styled.div<{ $type: MessageType }>`
  color: ${({ $type }) => getTypeColor($type)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-top: 2px;
`;

export const MessageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const MessageTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ice-main-color);
  line-height: 1.2;
`;

export const MessageText = styled.div`
  font-size: 0.8rem;
  color: var(--main-color);
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--main-color);
  transition: all 0.2s;
  flex-shrink: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
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
