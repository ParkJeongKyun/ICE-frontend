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
  const { currentMessage, hideCurrentMessage } = useMessage();

  if (!currentMessage) return null;

  const { title, message, type } = currentMessage;
  const Icon = ICON_MAP[type];

  return (
    <MessageModalContainer $isOpen={true}>
      <MessageBox $type={type}>
        <MessageIcon $type={type}>
          <Icon width={20} height={20} />
        </MessageIcon>
        <MessageContent>
          {title && <MessageTitle>{title}</MessageTitle>}
          <MessageText>{message}</MessageText>
        </MessageContent>
        <CloseButton onClick={hideCurrentMessage}>
          <XIcon width={16} height={16} />
        </CloseButton>
      </MessageBox>
    </MessageModalContainer>
  );
};

export default React.memo(MessageModal);
