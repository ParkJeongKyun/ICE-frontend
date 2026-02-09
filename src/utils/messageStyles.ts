import AlertIcon from '@/components/common/Icons/AlertIcon';
import CheckIcon from '@/components/common/Icons/CheckIcon';
import ErrorIcon from '@/components/common/Icons/ErrorIcon';
import InfoIcon from '@/components/common/Icons/InfoIcon';
import { MessageType } from '@/contexts/MessageContext/MessageContext';

export function getMessageTypeColor(type: MessageType): string {
  switch (type) {
    case 'error':
      return 'var(--ice-main-color-error)';
    case 'warning':
      return 'var(--ice-main-color-warning)';
    case 'success':
      return 'var(--ice-main-color-success)';
    default:
      return 'var(--ice-main-color)';
  }
}

export const MESSAGE_TYPE_ICONS = {
  error: ErrorIcon,
  warning: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
} as const;
