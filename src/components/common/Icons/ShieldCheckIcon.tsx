import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ShieldCheckIcon: React.FC<SvgIconProps> = ({
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
    <path d="M8.533.133a1.75 1.75 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48V8c0 3.56 2.826 6.307 6.504 7.447.28.086.712.086.992 0C12.174 14.307 15 11.56 15 8V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.533 1.4a.25.25 0 0 1 .152 0l5.25 1.68a.25.25 0 0 1 .174.238V8c0 2.996-2.266 5.388-5.439 6.396a.316.316 0 0 1-.138 0C4.766 13.388 2.5 10.996 2.5 8V3.48a.25.25 0 0 1 .174-.238ZM11.28 6.28a.75.75 0 0 0-1.06-1.06L7 8.44 5.78 7.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0Z" />
  </svg>
);

export default ShieldCheckIcon;
