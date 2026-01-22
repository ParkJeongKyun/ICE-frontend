import styled, { keyframes } from 'styled-components';
import { MessageType } from '@/contexts/MessageContext';
import { getMessageTypeColor } from '@/utils/messageStyles';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const MessageModalContainer = styled.div<{ $isMobile: boolean }>`
  position: fixed;
  top: 35px;
  right: 40px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  /* 모바일 버전용 */
  ${(props) =>
    props.$isMobile &&
    `
      bottom: auto;
      right: 10px;
      left: 10px;
    `}
`;

export const MessageBox = styled.div<{ $isMobile: boolean; $type: MessageType }>`
  position: relative;
  background-color: var(--main-bg-color);
  border: 1px solid ${({ $type }) => getMessageTypeColor($type)};
  border-left: 4px solid ${({ $type }) => getMessageTypeColor($type)};
  border-radius: 4px;
  padding: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 400px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  pointer-events: auto;
  animation: ${fadeIn} 0.15s ease-out;

   /* 모바일 버전용 */
  ${(props) =>
    props.$isMobile &&
    `
      min-width: auto;
      max-width: none;
      padding: 12px;
    `}
`;

export const MessageIcon = styled.div<{ $type: MessageType }>`
  color: ${({ $type }) => getMessageTypeColor($type)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-top: 2px;
`;

export const MessageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
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
