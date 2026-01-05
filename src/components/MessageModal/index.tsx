import React, { useMemo } from 'react';
import { useMessage } from '@/contexts/MessageContext';
import {
  ToastContainer,
  ToastBox,
  ToastIcon,
  ToastContent,
  ToastTitle,
  ToastText,
  CloseButton,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import InfoIcon from '@/components/common/Icons/InfoIcon';
import AlertIcon from '@/components/common/Icons/AlertIcon';
import CheckIcon from '@/components/common/Icons/CheckIcon';
import ErrorIcon from '@/components/common/Icons/ErrorIcon';

const iconMap = {
  error: ErrorIcon,
  warning: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
};

const MessageModal: React.FC = () => {
  const { currentMessage, hideCurrentMessage } = useMessage();

  const IconComponent = useMemo(() => {
    if (!currentMessage) return null;
    const Icon = iconMap[currentMessage.type];
    return <Icon width={24} height={24} />;
  }, [currentMessage]);

  if (!currentMessage) return null;

  const { title, message, type } = currentMessage;

  return (
    <ToastContainer $isOpen={true}>
      <ToastBox $type={type} $isOpen={true}>
        <ToastIcon $type={type}>{IconComponent}</ToastIcon>
        <ToastContent>
          {title && <ToastTitle>{title}</ToastTitle>}
          <ToastText>{message}</ToastText>
        </ToastContent>
        <CloseButton onClick={hideCurrentMessage}>
          <XIcon width={18} height={18} />
        </CloseButton>
      </ToastBox>
    </ToastContainer>
  );
};

export default React.memo(MessageModal);
