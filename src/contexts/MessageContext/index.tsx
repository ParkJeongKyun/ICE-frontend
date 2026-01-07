import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { MessageCode, getMessage, isValidMessageCode } from '@/constants/messages';

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

const MAX_TOAST_COUNT = 3;

interface MessageContextType {
  showMessage: (code: MessageCode | string, customMessage?: string) => void;
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

  const onMessage = useCallback((options: MessageOptions | string) => {
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

  const showMessage = useCallback(
    (code: MessageCode | string, customMessage?: string) => {
      if (!isValidMessageCode(code)) {
        console.warn('[MessageContext] Invalid error code:', code);
        const template = getMessage('UNKNOWN_ERROR', customMessage || code);
        onMessage(template);
        return;
      }

      const template = getMessage(code, customMessage);
      onMessage(template);
    },
    [onMessage]
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
