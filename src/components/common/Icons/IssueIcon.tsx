import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const IssueIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = 'currentColor',
}) => (
  <svg
    fill={color}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
  >
    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
  </svg>
);

export default IssueIcon;
