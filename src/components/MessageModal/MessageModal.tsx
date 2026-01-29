import React, { useCallback } from 'react';
import { useMessage } from '@/contexts/MessageContext/MessageContext';
import {
  MessageModalContainer,
  MessageBox,
  MessageIcon,
  MessageContent,
  MessageTitle,
  MessageText,
  CloseButton,
} from './MessageModal.styles';
import XIcon from '@/components/common/Icons/XIcon';
import InfoIcon from '@/components/common/Icons/InfoIcon';
import AlertIcon from '@/components/common/Icons/AlertIcon';
import CheckIcon from '@/components/common/Icons/CheckIcon';
import ErrorIcon from '@/components/common/Icons/ErrorIcon';
import { isMobile } from 'react-device-detect';

const ICON_MAP = {
  error: ErrorIcon,
  warning: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
};

const MessageModal: React.FC = () => {
  const { currentMessages, hideMessage } = useMessage();

  // ✅ 클로저로 안정적인 참조 보장
  const handleClose = useCallback(
    (id: string) => {
      hideMessage(id, true);
    },
    [hideMessage]
  );

  if (currentMessages.length === 0) return null;

  return (
    <MessageModalContainer $isMobile={isMobile}>
      {currentMessages.map((message) => {
        const Icon = ICON_MAP[message.type];
        return (
          <MessageBox
            key={message.id}
            $isMobile={isMobile}
            $type={message.type}
          >
            <MessageIcon $type={message.type}>
              <Icon width={20} height={20} />
            </MessageIcon>
            <MessageContent>
              {message.title && <MessageTitle>{message.title}</MessageTitle>}
              <MessageText>{message.message}</MessageText>
            </MessageContent>
            <CloseButton onClick={() => handleClose(message.id)}>
              <XIcon width={16} height={16} />
            </CloseButton>
          </MessageBox>
        );
      })}
    </MessageModalContainer>
  );
};

export default React.memo(MessageModal);
