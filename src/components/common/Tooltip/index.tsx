import React from 'react';
import styled from 'styled-components';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <TooltipWrapper>
      {children}
      <TooltipText>{text}</TooltipText>
    </TooltipWrapper>
  );
};

const TooltipWrapper = styled.div`
  position: relative; /* 툴팁을 상대적으로 위치시키기 위해 필요합니다. */
  display: inline-block;
  cursor: pointer;
`;

const TooltipText = styled.div`
  visibility: hidden;
  max-width: 120px;
  background-color: var(--main-hover-color);
  border: 1px solid var(--main-hover-line-color);
  color: var(--main-hover-line-color);
  text-align: center;
  border-radius: 4px;
  padding: 5px 5px;
  position: absolute;
  z-index: 1000;
  left: 100%;
  top: 100%;
  margin-left: 10px; /* 툴팁과 요소 간의 간격 조절 */
  margin-top: 10px; /* 툴팁과 요소 간의 간격 조절 */
  opacity: 0;
  transition: opacity 0.3s;

  ${TooltipWrapper}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

export default Tooltip;
