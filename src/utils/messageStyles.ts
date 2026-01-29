import { MessageType } from '@/contexts/MessageContext/MessageContext';

export function getMessageTypeColor(type: MessageType): string {
  switch (type) {
    case 'error':
      return '#dc3545';
    case 'warning':
      return '#ffc107';
    case 'success':
      return '#28a745';
    default:
      return 'var(--ice-main-color)';
  }
}

export const MESSAGE_TYPE_ICONS = {
  error: 'ErrorIcon',
  warning: 'AlertIcon',
  success: 'CheckIcon',
  info: 'InfoIcon',
} as const;
