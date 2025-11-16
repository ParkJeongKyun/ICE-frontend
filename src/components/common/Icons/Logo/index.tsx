import React from 'react';
import { LogoWrapper, Star } from './index.styles';

interface LogoProps {
  size?: number | string;
  bg?: string;
  star?: string;
  corner?: string | number;
}

const Logo: React.FC<LogoProps> = ({
  size = 64,
  bg = '#00B0F0',
  star = '#ffffff',
  corner = '20%',
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  const cornerValue = typeof corner === 'number' ? `${corner}%` : corner;

  return (
    <LogoWrapper
      style={
        {
          ['--size' as any]: sizeValue,
          ['--bg' as any]: bg,
          ['--corner' as any]: cornerValue,
          ['--arm-color' as any]: star,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <Star>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} />
        ))}
      </Star>
    </LogoWrapper>
  );
};

export default Logo;
