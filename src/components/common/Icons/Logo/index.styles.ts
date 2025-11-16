import styled from 'styled-components';

export const LogoWrapper = styled.div`
  --size: 64px;
  --bg: #00b0f0;
  --corner: 20%;

  width: var(--size);
  height: var(--size);
  background: var(--bg);
  border-radius: var(--corner);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 176, 240, 0.3);
    transform: rotate(360deg) scale(0.5);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const Star = styled.div`
  --arm-w: 8%;
  --arm-h: 33%;
  --arm-radius: 8px;
  --arm-color: #fff;

  position: relative;
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  ${LogoWrapper}:hover & {
    transform: rotate(360deg) scale(1.15);
  }

  ${LogoWrapper}:active & {
    transform: rotate(360deg) scale(0.95);
  }

  span {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--arm-w);
    height: var(--arm-h);
    background: var(--arm-color);
    border-radius: var(--arm-radius);
    transform-origin: 50% 100%;
    transition: all 0.3s ease-out;
  }

  ${LogoWrapper}:hover & span {
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.6);
    width: calc(var(--arm-w) * 1.2);
  }

  span:nth-child(1) {
    transform: translate(-50%, -100%) rotate(0deg);
  }
  span:nth-child(2) {
    transform: translate(-50%, -100%) rotate(45deg);
  }
  span:nth-child(3) {
    transform: translate(-50%, -100%) rotate(90deg);
  }
  span:nth-child(4) {
    transform: translate(-50%, -100%) rotate(135deg);
  }
  span:nth-child(5) {
    transform: translate(-50%, -100%) rotate(180deg);
  }
  span:nth-child(6) {
    transform: translate(-50%, -100%) rotate(225deg);
  }
  span:nth-child(7) {
    transform: translate(-50%, -100%) rotate(270deg);
  }
  span:nth-child(8) {
    transform: translate(-50%, -100%) rotate(315deg);
  }
`;
