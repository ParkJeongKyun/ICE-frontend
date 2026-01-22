import React, { useState, useEffect, useRef } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useTransitionStatus,
} from '@floating-ui/react';
import { isMobile } from 'react-device-detect';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  duration?: number; // 자동 닫힘 시간 (ms)
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, placement = 'bottom', duration = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!text || text.trim() === '') {
    return <>{children}</>;
  }

  // Floating UI 설정
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen, // 단순히 상태만 변경
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(2), flip(), shift({ padding: 8 })],
  });

  // 상호작용 정의
  const hover = useHover(context, { 
    move: false, 
    enabled: !isMobile, // PC에서만 호버 작동
    delay: { open: 200 },
  });

  const click = useClick(context, { 
    enabled: isMobile, // 모바일에서만 클릭(토글) 작동
    toggle: true,      // 다시 누르면 닫힘 (기본값)
  });
  const dismiss = useDismiss(context); // 바깥 누르면 닫힘
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
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
      >
        {children}
      </div>

      {isMounted && (
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
              whiteSpace: 'nowrap',
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
