import React from "react";

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const WindowsIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = "white",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-brand-windows"
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
    <path d="M17.8 20l-12 -1.5c-1 -.1 -1.8 -.9 -1.8 -1.9v-9.2c0 -1 .8 -1.8 1.8 -1.9l12 -1.5c1.2 -.1 2.2 .8 2.2 1.9v12.1c0 1.2 -1.1 2.1 -2.2 1.9z" />
    <path d="M12 5l0 14" />
    <path d="M4 12l16 0" />
  </svg>
);

export default WindowsIcon;