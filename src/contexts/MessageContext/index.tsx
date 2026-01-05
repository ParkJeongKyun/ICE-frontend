import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { ErrorCode, getErrorMessage } from '@/constants/messages';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface MessageItem {
  id: string;
  title?: string;
  message: React.ReactNode;
  type: MessageType;
  timestamp: number;
  read: boolean;
}

interface MessageOptions {
  title?: string;
  message: React.ReactNode;
  type?: MessageType;
  duration?: number;
  onClose?: () => void;
}

const MAX_TOAST_COUNT = 3; // 최대 토스트 표시 개수

interface MessageContextType {
  showMessage: (options: MessageOptions | string) => void;
  showError: (code: ErrorCode, customMessage?: string) => void;
  hideMessage: (id: string, removeFromHistory?: boolean) => void;
  currentMessages: MessageItem[]; // 배열로 변경
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

  const hideMessage = useCallback((id: string, removeFromHistory: boolean = false) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setCurrentMessages((prev) => prev.filter((msg) => msg.id !== id));
    
    if (removeFromHistory) {
      setMessageHistory((prev) => prev.filter((msg) => msg.id !== id));
    }
  }, []);

  const showMessage = useCallback((options: MessageOptions | string) => {
    const opts: MessageOptions =
      typeof options === 'string'
        ? { message: options, type: 'info', duration: 6000 }
        : { duration: 6000, type: 'info', ...options };

    const newMessage: MessageItem = {
      id: crypto.randomUUID(),
      title: opts.title,
      message: opts.message,
      type: opts.type!,
      timestamp: Date.now(),
      read: false,
    };

    setCurrentMessages((prev) => {
      const updated = [...prev, newMessage];
      if (updated.length > MAX_TOAST_COUNT) {
        const removed = updated.shift();
        if (removed) {
          // setTimeout으로 비동기 처리하여 상태 업데이트 충돌 방지
          setTimeout(() => hideMessage(removed.id), 0);
        }
      }
      return updated;
    });

    setMessageHistory((prev) => [newMessage, ...prev.slice(0, 99)]);

    if (opts.duration && opts.duration > 0) {
      const timeoutId = setTimeout(() => {
        hideMessage(newMessage.id, false);
      }, opts.duration);
      timeoutsRef.current.set(newMessage.id, timeoutId);
    }
  }, [hideMessage]);

  const showError = useCallback(
    (code: ErrorCode, customMessage?: string) => {
      const template = getErrorMessage(code, customMessage);
      showMessage(template);
    },
    [showMessage]
  );

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

  // useMemo 최적화 - 필수 값만 포함
  const value = useMemo(
    () => ({
      showMessage,
      showError,
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
      showError,
      currentMessages,
      messageHistory,
      unreadCount,
    ]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
