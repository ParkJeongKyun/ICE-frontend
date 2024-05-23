import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const PlusIcon: React.FC<SvgIconProps> = ({
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
      d="M4 12H20M12 4V20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PlusIcon;
