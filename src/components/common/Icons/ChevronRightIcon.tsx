import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronRightIcon: React.FC<SvgIconProps> = ({
  width = 14,
  height = 14,
  color = 'currentColor',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke={color}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 6l6 6l-6 6" />
  </svg>
);

export default ChevronRightIcon;
