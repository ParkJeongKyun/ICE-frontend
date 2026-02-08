'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useTranslations } from 'next-intl';
import eventBus from '@/types/eventBus';
import { getToastDefaults } from '@/utils/toastDefaults';
import type { WorkerStats } from '@/types/worker/index.worker.types';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface MessageItem {
  id: string;
  code?: string;
  title?: string;
  message: React.ReactNode;
  type: MessageType;
  timestamp: number;
  read: boolean;
  stats?: WorkerStats;
}

const MAX_TOAST_COUNT = 3;

interface MessageContextType {
  showMessage: (code: string, message?: string, stats?: WorkerStats) => void;
  hideMessage: (id: string, removeFromHistory?: boolean) => void;
  currentMessages: MessageItem[];
  messageHistory: MessageItem[];
  clearHistory: () => void;
  markAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  unreadCount: number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMessages, setCurrentMessages] = useState<MessageItem[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const t = useTranslations();

  const hideMessage = useCallback(
    (id: string, removeFromHistory: boolean = false) => {
      const timeout = timeoutsRef.current.get(id);
      if (timeout) {
        clearTimeout(timeout);
        timeoutsRef.current.delete(id);
      }
      setCurrentMessages((prev) => prev.filter((msg) => msg.id !== id));

      if (removeFromHistory) {
        setMessageHistory((prev) => prev.filter((msg) => msg.id !== id));
      }
    },
    []
  );

  const showMessage = useCallback(
    (code: string, message?: string, stats?: WorkerStats) => {
      // locale에서 title/msg 직접 로드
      const titleKey = `messages.${code}.title`;
      const messageKey = `messages.${code}.message`;

      let title = '';
      let msg: React.ReactNode = message || '';

      try {
        title = t(titleKey);
        if (!message) {
          msg = t(messageKey);
        }
      } catch (e) {
        title = code;
        msg = message || 'An error occurred';
      }

      // code별 타입과 duration 가져오기
      const { type, duration } = getToastDefaults(code);

      const newMessage: MessageItem = {
        id: crypto.randomUUID(),
        code,
        title,
        message: msg,
        type,
        timestamp: Date.now(),
        read: false,
        stats,
      };

      setCurrentMessages((prev) => {
        const updated = [...prev, newMessage];
        if (updated.length > MAX_TOAST_COUNT) {
          const removed = updated.shift();
          if (removed) {
            setTimeout(() => hideMessage(removed.id), 0);
          }
        }
        return updated;
      });

      setMessageHistory((prev) => [newMessage, ...prev.slice(0, 99)]);

      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          hideMessage(newMessage.id, false);
        }, duration);
        timeoutsRef.current.set(newMessage.id, timeoutId);
      }
    },
    [t, hideMessage]
  );

  // Subscribe to eventBus for toast events
  useEffect(() => {
    const handler = (payload: any) => {
      showMessage(payload.code, payload.message, payload.stats);
    };
    eventBus.on('toast', handler);
    return () => eventBus.off('toast', handler);
  }, [showMessage]);

  const clearHistory = useCallback(() => {
    setMessageHistory([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setMessageHistory((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessageHistory((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => messageHistory.filter((msg) => !msg.read).length,
    [messageHistory]
  );

  const value = useMemo(
    () => ({
      showMessage,
      hideMessage,
      currentMessages,
      messageHistory,
      clearHistory,
      markAsRead,
      deleteMessage,
      unreadCount,
    }),
    [
      showMessage,
      hideMessage,
      currentMessages,
      messageHistory,
      clearHistory,
      markAsRead,
      deleteMessage,
      unreadCount,
    ]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
