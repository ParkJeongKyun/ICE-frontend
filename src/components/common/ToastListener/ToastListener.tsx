'use client';
import { useEffect } from 'react';
import { useMessage } from '@/contexts/MessageContext/MessageContext';
import eventBus from '@/utils/eventBus';

export default function ToastListener() {
  const { showMessage } = useMessage();
  useEffect(() => {
    const handler = (payload: { code: string; customMessage?: string }) => {
      showMessage(payload.code, payload.customMessage);
    };
    eventBus.on('toast', handler);
    return () => eventBus.off('toast', handler);
  }, [showMessage]);
  return null;
}
