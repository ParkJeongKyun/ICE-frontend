import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const DoubleChevronsRightIcon: React.FC<SvgIconProps> = ({
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
    <polyline points="13 17 20 10 13 3" />
    <polyline points="6 17 13 10 6 3" />
  </svg>
);

export default DoubleChevronsRightIcon;
