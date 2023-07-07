import React from "react";

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const AndroidIcon: React.FC<SvgIconProps> = ({
  width = 18,
  height = 18,
  color = "white",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-brand-android"
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
    <path d="M4 10l0 6" />
    <path d="M20 10l0 6" />
    <path d="M7 9h10v8a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-8a5 5 0 0 1 10 0" />
    <path d="M8 3l1 2" />
    <path d="M16 3l-1 2" />
    <path d="M9 18l0 3" />
    <path d="M15 18l0 3" />
  </svg>
);

export default AndroidIcon;
