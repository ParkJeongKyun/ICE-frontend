import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const SearchIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = 'currentColor',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="11"
      cy="11"
      r="6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 20L15.5 15.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default SearchIcon;
