import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
import { formatBytes, formatSpeed, formatTime } from '@/utils/formatters';

const ICON_MAP = {
  error: ErrorIcon,
  warning: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
};

const MessageModal: React.FC = () => {
  const t = useTranslations('messages');
  const { currentMessages, hideMessage } = useMessage();

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
        const { stats } = message;

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
              {stats?.fileName && (
                <MessageText style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                  {t('stats.fileName')}: {stats.fileName} •{' '}
                  {t('stats.duration')}: {formatTime(stats.durationSec * 1000)}{' '}
                  • {t('stats.speed')}: {formatSpeed(stats.speed)} •{' '}
                  {t('stats.progress')}: {formatBytes(stats.processedBytes)} /{' '}
                  {formatBytes(stats.totalBytes)}
                </MessageText>
              )}
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
