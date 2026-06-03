import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const MapPinOffIcon: React.FC<SvgIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default MapPinOffIcon;
