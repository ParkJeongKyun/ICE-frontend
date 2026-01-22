import styled from 'styled-components';
import { MessageType } from '@/contexts/MessageContext';
import { getMessageTypeColor } from '@/utils/messageStyles';

export const HistoryButton = styled.button<{ $hasUnread: boolean }>`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  transition: all 0.2s;
  border-radius: 0;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

export const HistoryBadge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 4px;
  height: 4px;
  background-color: var(--ice-main-color);
  border-radius: 50%;
`;

export const HistoryOverlay = styled.div<{ $isMobile: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1100;
  display: ${({ $isMobile }) => ($isMobile ? 'block' : 'none')};
`;

export const HistoryPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 5px;
  width: 350px;
  max-height: 500px;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1101;
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 60px;
    left: 10px;
    right: 10px;
    width: auto;
    max-height: 60vh;
  }
`;

export const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 26px;
  padding: 2px 8px;
  border-bottom: 1px solid var(--main-line-color);
`;

export const HistoryTitle = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const HistoryActions = styled.div`
  display: flex;
  gap: 4px;
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
  border-radius: 3px;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

export const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--main-line-color);
    border-radius: 3px;
  }
`;

export const HistoryItem = styled.div<{
  $type: MessageType;
  $read: boolean;
  $isOpen: boolean;
}>`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 6px;
  background-color: ${({ $read }) =>
    $read ? 'transparent' : 'var(--main-hover-color)'};
  border-left: 2px solid ${({ $type }) => getMessageTypeColor($type)};
  border-radius: 3px;
  transition: all 0.2s;
  opacity: ${({ $read }) => ($read ? 0.7 : 1)};
  overflow: hidden;

  &:hover {
    background-color: var(--main-hover-color);
    opacity: 1;
  }
`;

export const HistoryItemHeader = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  align-items: center;

  @media (max-width: 768px) {
    padding: 6px;
    gap: 6px;
  }
`;

export const HistoryItemIcon = styled.div<{ $type: MessageType }>`
  color: ${({ $type }) => getMessageTypeColor($type)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

export const HistoryItemTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const HistoryItemBody = styled.div`
  padding: 0 8px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 768px) {
    padding: 0 6px 6px 6px;
  }
`;

export const HistoryItemMessagePreview = styled.div`
  font-size: 0.75rem;
  color: var(--main-color);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HistoryItemMessage = styled.div`
  font-size: 0.75rem;
  color: var(--main-color);
  line-height: 1.3;
  word-break: break-word;
  white-space: pre-wrap;
  user-select: text;
`;

export const HistoryItemTime = styled.div`
  font-size: 0.65rem;
  color: var(--main-color);
  opacity: 0.7;
`;

export const HistoryItemActions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
`;

export const HistoryItemDelete = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: var(--main-color);
  transition: all 0.2s;
  border-radius: 3px;
  display: flex;
  align-items: center;

  &:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

export const ExpandIcon = styled.div<{ $isOpen: boolean }>`
  color: var(--main-color);
  display: flex;
  align-items: center;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s;
`;

export const EmptyHistory = styled.div`
  text-align: center;
  padding: 5px;
  color: var(--main-color);
  opacity: 0.7;
  font-size: 0.75rem;
`;
