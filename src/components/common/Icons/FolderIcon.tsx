import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const FolderIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = 'white',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    stroke={color}
  >
    <path d="M20,6h-8l-1.414-1.414C10.211,4.211,9.702,4,9.172,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8 C22,6.9,21.1,6,20,6z M20,18H4V8h16V18z"></path>
  </svg>
);

export default FolderIcon;
