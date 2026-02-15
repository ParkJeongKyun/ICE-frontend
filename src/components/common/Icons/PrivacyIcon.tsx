import React from 'react';

const PrivacyIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Privacy Policy"
  >
    {/* Padlock outline only */}
    <rect
      x="5"
      y="11"
      width="14"
      height="9"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M7 11V8a5 5 0 0 1 10 0v3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default PrivacyIcon;
