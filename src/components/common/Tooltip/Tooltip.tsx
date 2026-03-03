import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useTransitionStatus,
} from '@floating-ui/react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  placement = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasText = Boolean(text && text.trim() !== '');

  // Floating UI 설정
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen, // 단순히 상태만 변경
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(2), flip(), shift({ padding: 8 })],
  });

  // 상호작용 정의 (기기 구분 없음)
  const hover = useHover(context, {
    move: false,
    delay: { open: 200 },
  });

  const focus = useFocus(context);

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // 애니메이션 효과
  const { isMounted, status } = useTransitionStatus(context, { duration: 150 });
  const opacity = status === 'open' ? 1 : 0;

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        style={{ display: 'inline-block', cursor: 'pointer' }}
        tabIndex={0}
      >
        {children}
      </div>

      {hasText && isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              backgroundColor: 'var(--main-bg-color)',
              color: 'var(--main-color)',
              border: '1px solid var(--main-line-color)',
              padding: '4px 8px',
              borderRadius: '3px',
              fontSize: '0.7rem',
              maxWidth: '300px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              zIndex: 1202,
              pointerEvents: 'none',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
              opacity: opacity,
              transition: 'opacity 0.15s ease',
              willChange: 'transform',
            }}
            {...getFloatingProps()}
          >
            {text}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default Tooltip;
