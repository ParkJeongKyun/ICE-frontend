import React, { useState, useCallback } from 'react';
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
    HistoryItemIcon,
    HistoryItemContent,
    HistoryItemTitle,
    HistoryItemMessage,
    HistoryItemTime,
    HistoryItemDelete,
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
import { isMobile } from 'react-device-detect';

const MessageHistory: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { messageHistory, unreadCount, clearHistory, markAsRead, deleteMessage } =
        useMessage();

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => {
            if (!prev && unreadCount > 0) {
                messageHistory.forEach((msg) => {
                    if (!msg.read) markAsRead(msg.id);
                });
            }
            return !prev;
        });
    }, [messageHistory, unreadCount, markAsRead]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const formatTime = useCallback((timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;

        return new Date(timestamp).toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const getIcon = useCallback((type: MessageItem['type']) => {
        const props = { width: 14, height: 14 };
        const icons = {
            error: ErrorIcon,
            warning: AlertIcon,
            success: CheckIcon,
            info: InfoIcon,
        };
        const Icon = icons[type] || InfoIcon;
        return <Icon {...props} />;
    }, []);

    return (
        <>
            <HistoryButton onClick={handleToggle} $hasUnread={unreadCount > 0}>
                <BellIcon width={16} height={16} />
                {unreadCount > 0 && <HistoryBadge>{unreadCount}</HistoryBadge>}
            </HistoryButton>

            {isOpen && <HistoryOverlay $isMobile={isMobile} onClick={handleClose} />}

            <HistoryPanel $isOpen={isOpen}>
                <HistoryHeader>
                    <HistoryTitle>Notifications</HistoryTitle>
                    <HistoryActions>
                        {messageHistory.length > 0 && (
                            <HistoryClearBtn onClick={clearHistory} title="모두 지우기">
                                <TrashIcon width={14} height={14} />
                            </HistoryClearBtn>
                        )}
                        <HistoryClearBtn onClick={handleClose} title="닫기">
                            <XIcon width={14} height={14} />
                        </HistoryClearBtn>
                    </HistoryActions>
                </HistoryHeader>

                <HistoryList>
                    {messageHistory.length === 0 ? (
                        <EmptyHistory>알림이 없습니다</EmptyHistory>
                    ) : (
                        messageHistory.map((msg) => (
                            <HistoryItem key={msg.id} $type={msg.type} $read={msg.read}>
                                <HistoryItemIcon $type={msg.type}>
                                    {getIcon(msg.type)}
                                </HistoryItemIcon>
                                <HistoryItemContent>
                                    {msg.title && <HistoryItemTitle>{msg.title}</HistoryItemTitle>}
                                    <HistoryItemMessage>{msg.message}</HistoryItemMessage>
                                    <HistoryItemTime>{formatTime(msg.timestamp)}</HistoryItemTime>
                                </HistoryItemContent>
                                <HistoryItemDelete
                                    onClick={() => deleteMessage(msg.id)}
                                    title="삭제"
                                >
                                    <XIcon width={14} height={14} />
                                </HistoryItemDelete>
                            </HistoryItem>
                        ))
                    )}
                </HistoryList>
            </HistoryPanel>
        </>
    );
};

export default React.memo(MessageHistory);
