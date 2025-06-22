import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const BackArrowIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = 'white',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke={color}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 14l-4 -4l4 -4" />
    <path d="M5 10h7a4 4 0 1 1 0 8h-1" />
  </svg>
);

export default BackArrowIcon;
