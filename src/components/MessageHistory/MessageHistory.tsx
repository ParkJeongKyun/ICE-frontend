'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useMessage } from '@/contexts/MessageContext/MessageContext';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import { formatBytes, formatSpeed, formatTime } from '@/utils/formatters';
import {
  HistoryButton,
  HistoryBadge,
  HistoryPanel,
  HistoryHeader,
  HistoryTitle,
  HistoryActions,
  HistoryClearBtn,
  HistoryList,
  HistoryItem,
  HistoryItemHeader,
  HistoryItemIcon,
  HistoryItemTitle,
  HistoryItemMessagePreview,
  HistoryItemBody,
  HistoryItemMessage,
  HistoryItemTime,
  HistoryItemActions,
  HistoryItemDelete,
  ExpandIcon,
  EmptyHistory,
  HistoryOverlay,
} from './MessageHistory.styles';
import XIcon from '@/components/common/Icons/XIcon';
import BellIcon from '@/components/common/Icons/BellIcon';
import InfoIcon from '@/components/common/Icons/InfoIcon';
import AlertIcon from '@/components/common/Icons/AlertIcon';
import CheckIcon from '@/components/common/Icons/CheckIcon';
import ErrorIcon from '@/components/common/Icons/ErrorIcon';
import TrashIcon from '@/components/common/Icons/TrashIcon';
import ChevronDownIcon from '@/components/common/Icons/ChevronDownIcon';
import { isMobile } from 'react-device-detect';
import { getDate } from '@/utils/exifParser';

const ICON_MAP = {
  error: ErrorIcon,
  warning: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
};

const MessageHistory: React.FC = () => {
  const t = useTranslations('messages');
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const {
    messageHistory,
    unreadCount,
    clearHistory,
    markAsRead,
    deleteMessage,
  } = useMessage();

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    markAsRead(id);
  }, []);

  return (
    <>
      <HistoryButton onClick={handleToggle} $hasUnread={unreadCount > 0}>
        <BellIcon width={14} height={14} />
        {unreadCount > 0 && <HistoryBadge />}
      </HistoryButton>

      {isOpen && <HistoryOverlay $isMobile={isMobile} onClick={handleClose} />}

      <HistoryPanel $isOpen={isOpen}>
        <HistoryHeader>
          <HistoryTitle>{t('notifications.title')}</HistoryTitle>
          <HistoryActions>
            {messageHistory.length > 0 && (
              <Tooltip text={t('notifications.clearAll')}>
                <HistoryClearBtn onClick={clearHistory}>
                  <TrashIcon width={14} height={14} />
                </HistoryClearBtn>
              </Tooltip>
            )}
            <Tooltip text={t('notifications.close')}>
              <HistoryClearBtn onClick={handleClose}>
                <XIcon width={14} height={14} />
              </HistoryClearBtn>
            </Tooltip>
          </HistoryActions>
        </HistoryHeader>

        <HistoryList>
          {messageHistory.length === 0 ? (
            <EmptyHistory>{t('notifications.noNotifications')}</EmptyHistory>
          ) : (
            messageHistory.map((msg) => {
              const isExpanded = expandedItems.has(msg.id);
              const { stats } = msg;

              return (
                <HistoryItem
                  key={msg.id}
                  $type={msg.type}
                  $read={msg.read}
                  $isOpen={isExpanded}
                >
                  <HistoryItemHeader onClick={() => toggleExpand(msg.id)}>
                    <HistoryItemIcon $type={msg.type}>
                      {(() => {
                        const Icon = ICON_MAP[msg.type] || InfoIcon;
                        return <Icon width={14} height={14} />;
                      })()}
                    </HistoryItemIcon>
                    {msg.title && (
                      <HistoryItemTitle>{msg.title}</HistoryItemTitle>
                    )}
                    <HistoryItemActions onClick={(e) => e.stopPropagation()}>
                      <Tooltip text={t('notifications.delete')}>
                        <HistoryItemDelete
                          onClick={() => deleteMessage(msg.id)}
                        >
                          <XIcon width={14} height={14} />
                        </HistoryItemDelete>
                      </Tooltip>
                    </HistoryItemActions>
                    <ExpandIcon $isOpen={isExpanded}>
                      <ChevronDownIcon width={14} height={14} />
                    </ExpandIcon>
                  </HistoryItemHeader>
                  {isExpanded ? (
                    <HistoryItemBody>
                      <HistoryItemMessage>
                        {msg.message}
                        {stats?.fileName && (
                          <>
                            <br />
                            <span
                              style={{ fontSize: '0.75rem', opacity: 0.85 }}
                            >
                              {t('stats.fileName')}: {stats.fileName} •{' '}
                              {t('stats.duration')}:{' '}
                              {formatTime(stats.durationSec * 1000)} •{' '}
                              {t('stats.speed')}: {formatSpeed(stats.speed)} •{' '}
                              {t('stats.progress')}:{' '}
                              {formatBytes(stats.processedBytes)} /{' '}
                              {formatBytes(stats.totalBytes)}
                            </span>
                          </>
                        )}
                      </HistoryItemMessage>
                      <HistoryItemTime>
                        {getDate(msg.timestamp)}
                      </HistoryItemTime>
                    </HistoryItemBody>
                  ) : (
                    <HistoryItemBody>
                      <HistoryItemMessagePreview>
                        {stats?.fileName
                          ? `${t('stats.fileName')}: ${stats.fileName} • ${t('stats.duration')}: ${formatTime(stats.durationSec * 1000)} • ${t('stats.speed')}: ${formatSpeed(stats.speed)} • ${t('stats.progress')}: ${formatBytes(stats.processedBytes)} / ${formatBytes(stats.totalBytes)}`
                          : typeof msg.message === 'string'
                            ? msg.message.split('\n')[0]
                            : ''}
                      </HistoryItemMessagePreview>
                    </HistoryItemBody>
                  )}
                </HistoryItem>
              );
            })
          )}
        </HistoryList>
      </HistoryPanel>
    </>
  );
};

export default React.memo(MessageHistory);
