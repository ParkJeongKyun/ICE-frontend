import styled, { keyframes } from 'styled-components';
import { MessageType } from '@/contexts/MessageContext/MessageContext';
import { getMessageTypeColor } from '@/utils/messageStyles';
import { BREAKPOINTS } from '@/layouts/MainLayout/MainLayout.styles';

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const MessageModalContainer = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 10000;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  pointer-events: none;

  @media (max-width: ${BREAKPOINTS.mobile}) {
    bottom: 65px;
    right: 16px;
    left: 16px;
  }
`;

export const MessageBox = styled.div<{
  $type: MessageType;
}>`
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
  cursor: pointer;
  animation: ${slideUp} 0.2s ease-out;

  @media (max-width: ${BREAKPOINTS.mobile}) {
    min-width: auto;
    max-width: none;
    padding: 12px;
  }
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

export const MessageTitle = styled.div<{ $type: MessageType }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $type }) => getMessageTypeColor($type)};
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
