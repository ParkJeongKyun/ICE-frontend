import React, { useState, useCallback, useEffect } from 'react';
import { useMessage, MessageItem } from '@/contexts/MessageContext';
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
    HistoryItemPreview,
    HistoryItemTitle,
    HistoryItemMessagePreview,
    HistoryItemExpanded,
    HistoryItemMessage,
    HistoryItemTime,
    HistoryItemActions,
    HistoryItemDelete,
    ExpandIcon,
    EmptyHistory,
    HistoryOverlay,
} from './index.styles';
import XIcon from '@/components/common/Icons/XIcon';
import BellIcon from '@/components/common/Icons/BellIcon';
import InfoIcon from '@/components/common/Icons/InfoIcon';
import AlertIcon from '@/components/common/Icons/AlertIcon';
import CheckIcon from '@/components/common/Icons/CheckIcon';
import ErrorIcon from '@/components/common/Icons/ErrorIcon';
import TrashIcon from '@/components/common/Icons/TrashIcon';
import ChevronDownIcon from '@/components/common/Icons/ChevronDownIcon';
import { isMobile } from 'react-device-detect';

const ICON_MAP = {
    error: ErrorIcon,
    warning: AlertIcon,
    success: CheckIcon,
    info: InfoIcon,
};

const MessageHistory: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const { messageHistory, unreadCount, clearHistory, markAsRead, deleteMessage } = useMessage();

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
    }, []);

    const formatFullTime = useCallback((timestamp: number) => {
        return new Date(timestamp).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }, []);

    const getIcon = useCallback((type: MessageItem['type']) => {
        const Icon = ICON_MAP[type] || InfoIcon;
        return <Icon width={12} height={12} />;
    }, []);

    const getMessagePreview = useCallback((message: React.ReactNode) => {
        if (typeof message === 'string') {
            return message.split('\n')[0];
        }
        return '메시지 내용';
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
                    <HistoryTitle>Notifications</HistoryTitle>
                    <HistoryActions>
                        {messageHistory.length > 0 && (
                            <HistoryClearBtn onClick={clearHistory} title="모두 지우기">
                                <TrashIcon width={12} height={12} />
                            </HistoryClearBtn>
                        )}
                        <HistoryClearBtn onClick={handleClose} title="닫기">
                            <XIcon width={12} height={12} />
                        </HistoryClearBtn>
                    </HistoryActions>
                </HistoryHeader>

                <HistoryList>
                    {messageHistory.length === 0 ? (
                        <EmptyHistory>알림이 없습니다</EmptyHistory>
                    ) : (
                        messageHistory.map((msg) => {
                            const isExpanded = expandedItems.has(msg.id);
                            return (
                                <HistoryItem
                                    key={msg.id}
                                    $type={msg.type}
                                    $read={msg.read}
                                    $isOpen={isExpanded}
                                >
                                    <HistoryItemHeader onClick={() => toggleExpand(msg.id)}>
                                        <HistoryItemIcon $type={msg.type}>
                                            {getIcon(msg.type)}
                                        </HistoryItemIcon>
                                        <HistoryItemPreview>
                                            {msg.title && <HistoryItemTitle>{msg.title}</HistoryItemTitle>}
                                            <HistoryItemMessagePreview>
                                                {getMessagePreview(msg.message)}
                                            </HistoryItemMessagePreview>
                                        </HistoryItemPreview>
                                        <HistoryItemActions onClick={(e) => e.stopPropagation()}>
                                            <HistoryItemDelete onClick={() => deleteMessage(msg.id)} title="삭제">
                                                <XIcon width={10} height={10} />
                                            </HistoryItemDelete>
                                        </HistoryItemActions>
                                        <ExpandIcon $isOpen={isExpanded}>
                                            <ChevronDownIcon width={12} height={12} />
                                        </ExpandIcon>
                                    </HistoryItemHeader>
                                    {isExpanded && (
                                        <HistoryItemExpanded>
                                            <HistoryItemMessage>{msg.message}</HistoryItemMessage>
                                            <HistoryItemTime>{formatFullTime(msg.timestamp)}</HistoryItemTime>
                                        </HistoryItemExpanded>
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
