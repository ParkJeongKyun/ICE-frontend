import React from 'react';
import {
  LogoContainer,
  LogoWrapper,
  LogoInner,
  LogoText,
  Star,
} from './Logo.styles';

interface LogoProps {
  size?: number | string;
  bg?: string;
  star?: string;
  corner?: string | number;
  showText?: boolean;
  textSize?: number | string;
  textColor?: string;
  textWeight?: number;
  textGap?: number | string;
  letterSpacing?: number | string;
  fontFamily?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 16,
  bg = 'var(--ice-icon-bg-color)',
  star = 'var(--ice-color-white)',
  corner = '20%',
  showText = false,
  textSize = 14,
  textColor = 'var(--ice-color-white)',
  textWeight = 500,
  textGap = 1,
  letterSpacing = -1,
  fontFamily = 'Arial',
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  const cornerValue = typeof corner === 'number' ? `${corner}%` : corner;
  const textSizeValue =
    typeof textSize === 'number' ? `${textSize}px` : textSize;
  const textGapValue = typeof textGap === 'number' ? `${textGap}px` : textGap;
  const letterSpacingValue =
    typeof letterSpacing === 'number' ? `${letterSpacing}px` : letterSpacing;

  const cssVars = {
    ['--size' as string]: sizeValue,
    ['--bg' as string]: bg,
    ['--corner' as string]: cornerValue,
    ['--arm-w' as string]: '10%',
    ['--arm-h' as string]: '35%',
    ['--arm-radius' as string]: '8px',
    ['--arm-color' as string]: star,
    ['--text-size' as string]: textSizeValue,
    ['--text-color' as string]: textColor,
    ['--text-weight' as string]: textWeight.toString(),
    ['--text-gap' as string]: textGapValue,
    ['--letter-spacing' as string]: letterSpacingValue,
    ['--font-family' as string]: fontFamily,
  } as React.CSSProperties;

  const logoIcon = (
    <LogoWrapper style={cssVars} aria-hidden="true">
      <LogoInner>
        <Star>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} />
          ))}
        </Star>
      </LogoInner>
    </LogoWrapper>
  );

  if (!showText) {
    return logoIcon;
  }

  return (
    <LogoContainer style={cssVars}>
      {logoIcon}
      <LogoText>ICE</LogoText>
    </LogoContainer>
  );
};

export default Logo;
