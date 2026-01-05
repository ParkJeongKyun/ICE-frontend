import styled from 'styled-components';

export const SpinnerWrapper = styled.div<{ $size: number; $color: string }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  span {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 5%;
    height: 30%;
    background: ${({ $color }) => $color};
    border-radius: 2px;
    transform-origin: 50% 100%;
    animation: spinner-arm 1.2s ease-in-out infinite;
  }

  span:nth-child(1) { transform: translate(-50%, -100%) rotate(0deg); }
  span:nth-child(2) { transform: translate(-50%, -100%) rotate(45deg); }
  span:nth-child(3) { transform: translate(-50%, -100%) rotate(90deg); }
  span:nth-child(4) { transform: translate(-50%, -100%) rotate(135deg); }
  span:nth-child(5) { transform: translate(-50%, -100%) rotate(180deg); }
  span:nth-child(6) { transform: translate(-50%, -100%) rotate(225deg); }
  span:nth-child(7) { transform: translate(-50%, -100%) rotate(270deg); }
  span:nth-child(8) { transform: translate(-50%, -100%) rotate(315deg); }

  @keyframes spinner-arm {
    0%,
    100% {
      width: 8%;
      opacity: 0.4;
    }
    50% {
      width: 12%;
      opacity: 1;
    }
  }

  animation: spinner-rotate 2.4s linear infinite;

  @keyframes spinner-rotate {
    0% {
      transform: rotate(0deg) scale(1.2);
    }
    100% {
      transform: rotate(360deg) scale(0.95);
    }
  }
`;
