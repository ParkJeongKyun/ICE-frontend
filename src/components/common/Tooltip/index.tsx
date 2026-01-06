import React, { useState } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  type?: 'fixed' | 'follow';
  forceHide?: boolean;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  text, 
  children, 
  type = 'follow', 
  forceHide = false,
  delay = 500 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (type === 'follow') {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = () => {
    setIsHovered(false);
  };

  const shouldShow = isHovered && !forceHide;

  return (
    <Wrapper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {children}
      {shouldShow && type === 'fixed' && (
        <FixedContent $delay={delay}>
          {text}
        </FixedContent>
      )}
      {shouldShow && type === 'follow' && (
        <FollowContent $x={mousePos.x} $y={mousePos.y} $delay={delay}>
          {text}
        </FollowContent>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  height: 100%;
`;

const FixedContent = styled.div<{ $delay: number }>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  color: var(--main-color);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 100001;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  opacity: 0;
  animation: fadeInUp 0.15s forwards;
  animation-delay: ${({ $delay }) => $delay}ms;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(4px);
    }
    to {
      opacity: 0.95;
      transform: translateX(-50%) translateY(0);
    }
  }

  /* Arrow */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--main-line-color);
  }
`;

const FollowContent = styled.div<{ $x: number; $y: number; $delay: number }>`
  position: fixed;
  left: ${({ $x }) => $x + 12}px;
  top: ${({ $y }) => $y + 12}px;
  background: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  color: var(--main-color);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 100001;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  opacity: 0;
  animation: fadeIn 0.15s forwards;
  animation-delay: ${({ $delay }) => $delay}ms;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.95;
    }
  }
`;

export default Tooltip;
