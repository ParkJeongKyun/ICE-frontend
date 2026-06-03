import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const InfoCircleIcon: React.FC<SvgIconProps> = ({
  width = 16,
  height = 16,
  color = 'currentColor',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill={color}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM9 5H7v4h2V5Zm0 6H7v2h2v-2Z" />
  </svg>
);

export default InfoCircleIcon;
