import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronLeftIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
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
    <path d="M15 6l-6 6l6 6" />
  </svg>
);

export default ChevronLeftIcon;
