import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const ScrollArrowIcon: React.FC<SvgIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  className,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 5v14M12 19l-7-7M12 19l7-7" />
  </svg>
);

export default ScrollArrowIcon;
