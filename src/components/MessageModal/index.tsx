import React from 'react';
import { useMessage } from '@/contexts/MessageContext';
import {
  MessageModalContainer,
  MessageBox,
  MessageIcon,
  MessageContent,
  MessageTitle,
  MessageText,
  CloseButton,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import InfoIcon from '@/components/common/Icons/InfoIcon';
import AlertIcon from '@/components/common/Icons/AlertIcon';
import CheckIcon from '@/components/common/Icons/CheckIcon';
import ErrorIcon from '@/components/common/Icons/ErrorIcon';

const ICON_MAP = {
  error: ErrorIcon,
  warning: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
};

const MessageModal: React.FC = () => {
  const { currentMessages, hideMessage } = useMessage();

  if (currentMessages.length === 0) return null;

  return (
    <MessageModalContainer>
      {currentMessages.map((message) => {
        const Icon = ICON_MAP[message.type];
        return (
          <MessageBox key={message.id} $type={message.type}>
            <MessageIcon $type={message.type}>
              <Icon width={20} height={20} />
            </MessageIcon>
            <MessageContent>
              {message.title && <MessageTitle>{message.title}</MessageTitle>}
              <MessageText>{message.message}</MessageText>
            </MessageContent>
            <CloseButton onClick={() => hideMessage(message.id, true)}>
              <XIcon width={16} height={16} />
            </CloseButton>
          </MessageBox>
        );
      })}
    </MessageModalContainer>
  );
};

export default React.memo(MessageModal);
