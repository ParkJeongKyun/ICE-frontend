import React, { useState } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ left: left + width / 2, top: top + height });
  };

  return (
    <TooltipWrapper onMouseEnter={handleMouseEnter}>
      {children}
      <TooltipText
        style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
      >
        {text}
      </TooltipText>
    </TooltipWrapper>
  );
};

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  cursor: pointer;
`;

const TooltipText = styled.div`
  visibility: hidden;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  color: var(--main-color);
  text-align: center;
  border-radius: 4px;
  padding: 5px 5px;
  position: fixed;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.75rem;
  ${TooltipWrapper}:hover & {
    visibility: visible;
    opacity: 0.8;
  }
`;

export default Tooltip;
