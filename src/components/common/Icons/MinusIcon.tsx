import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const MinusIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = 'white',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 12L18 12"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default MinusIcon;
