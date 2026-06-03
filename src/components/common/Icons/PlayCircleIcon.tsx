import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const PlayCircleIcon: React.FC<SvgIconProps> = ({
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
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
  </svg>
);

export default PlayCircleIcon;
