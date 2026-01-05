import styled, { keyframes } from 'styled-components';
import { MessageType } from '@/contexts/MessageContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const HistoryButton = styled.button<{ $hasUnread: boolean }>`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  transition: all 0.2s;
  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
  ${({ $hasUnread }) =>
    $hasUnread &&
    `
    animation: pulse 2s ease-in-out infinite;
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `}
`;

export const HistoryBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #dc3545;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
`;

export const HistoryOverlay = styled.div<{ $isMobile: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9998;
  animation: ${fadeIn} 0.2s ease-out;
  display: ${({ $isMobile }) => ($isMobile ? 'block' : 'none')};
`;

export const HistoryPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 5px;
  width: 400px;
  max-height: 600px;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 60px;
    left: 10px;
    right: 10px;
    width: auto;
    max-height: 70vh;
  }
`;

export const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 5px 5px 10px;
  border-bottom: 1px solid var(--main-line-color);
`;

export const HistoryTitle = styled.h3`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const HistoryActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const HistoryClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  padding: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  border-radius: 4px;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

export const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--main-line-color);
    border-radius: 4px;
  }
`;

export const HistoryItem = styled.div<{ $type: MessageType; $read: boolean }>`
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background-color: ${({ $read }) =>
    $read ? 'transparent' : 'var(--main-hover-color)'};
  border-left: 3px solid ${({ $type }) => getTypeColor($type)};
  border-radius: 4px;
  transition: all 0.2s;
  opacity: ${({ $read }) => ($read ? 0.7 : 1)};

  &:hover {
    background-color: var(--main-hover-color);
    opacity: 1;
  }

  @media (max-width: 768px) {
    padding: 10px;
    gap: 10px;
  }
`;

export const HistoryItemIcon = styled.div<{ $type: MessageType }>`
  color: ${({ $type }) => getTypeColor($type)};
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
`;

export const HistoryItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const HistoryItemTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const HistoryItemMessage = styled.div`
  font-size: 0.8rem;
  color: var(--main-color);
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
`;

export const HistoryItemTime = styled.div`
  font-size: 0.7rem;
  color: var(--main-color);
  opacity: 0.7;
  margin-top: 4px;
`;

export const HistoryItemDelete = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--main-color);
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0;
  border-radius: 4px;

  ${HistoryItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

export const EmptyHistory = styled.div`
  text-align: center;
  padding: 5px 5px;
  color: var(--main-color);
  opacity: 0.7;
  font-size: 0.85rem;
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
