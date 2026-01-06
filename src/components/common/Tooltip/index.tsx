import React, { useState } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <Wrapper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isHovered && (
        <Content $x={mousePos.x} $y={mousePos.y}>
          {text}
        </Content>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: inline-flex;
  height: 100%;
`;

const Content = styled.div.attrs<{ $x: number; $y: number }>(({ $x, $y }) => ({
  style: {
    left: `${$x + 12}px`,
    top: `${$y + 12}px`,
  },
}))<{ $x: number; $y: number }>`
  position: fixed;
  background: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  color: var(--main-color);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 900;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export default Tooltip;
