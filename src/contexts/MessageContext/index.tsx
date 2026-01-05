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

interface MessageContextType {
  showMessage: (options: MessageOptions | string) => void;
  showError: (code: ErrorCode, customMessage?: string) => void;
  hideCurrentMessage: () => void;
  currentMessage: MessageItem | null;
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
  const [currentMessage, setCurrentMessage] = useState<MessageItem | null>(null);
  const [messageHistory, setMessageHistory] = useState<MessageItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = useCallback((options: MessageOptions | string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const opts: MessageOptions =
      typeof options === 'string'
        ? { message: options, type: 'info', duration: 3000 }
        : { duration: 3000, type: 'info', ...options };

    const newMessage: MessageItem = {
      id: crypto.randomUUID(),
      title: opts.title,
      message: opts.message,
      type: opts.type!,
      timestamp: Date.now(),
      read: false,
    };

    setCurrentMessage(newMessage);
    setMessageHistory((prev) => [newMessage, ...prev.slice(0, 99)]); // 최대 100개 유지

    if (opts.duration && opts.duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage(null);
        timeoutRef.current = null;
      }, opts.duration);
    }
  }, []);

  const showError = useCallback(
    (code: ErrorCode, customMessage?: string) => {
      const template = getErrorMessage(code, customMessage);
      showMessage(template);
    },
    [showMessage]
  );

  const hideCurrentMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (currentMessage) {
      setMessageHistory((prev) =>
        prev.map((msg) =>
          msg.id === currentMessage.id ? { ...msg, read: true } : msg
        )
      );
    }
    setCurrentMessage(null);
  }, [currentMessage]);

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
      showError,
      hideCurrentMessage,
      currentMessage,
      messageHistory,
      clearHistory,
      markAsRead,
      deleteMessage,
      unreadCount,
    }),
    [
      showMessage,
      showError,
      hideCurrentMessage,
      currentMessage,
      messageHistory,
      clearHistory,
      markAsRead,
      deleteMessage,
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
