import styled, { keyframes } from 'styled-components';

// 홀로그램 색상 변화 애니메이션
const holoGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const LanyardWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Card = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
    z-index: 1;
  }

  /* 홀로그램 및 광택 효과 */
  .glare {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    mix-blend-mode: screen;
    background-size: 200% 200%;
    background-image: linear-gradient(
      110deg,
      transparent 25%,
      rgba(150, 255, 255, 0.1) 45%,
      rgba(255, 150, 255, 0.1) 50%,
      rgba(150, 255, 255, 0.1) 55%,
      transparent 75%
    );
    animation: ${holoGradient} 8s infinite linear;

    /* 빛이 맺히는 입자감 표현 */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.1;
      background-image: radial-gradient(#fff 1px, transparent 1px);
      background-size: 4px 4px;
    }
  }

  /* 플라스틱 질감을 위한 노이즈 패턴 레이어 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    border-radius: 16px;
  }
`;

const CardFace = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;

  /* 카드 측면의 깎인 면(Bezel) 표현 */
  border: 1px solid rgba(255, 255, 255, 0.2);

  /* 내부 그림자로 인쇄물이 카드 안쪽에 있는 듯한 깊이감 추가 */
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.3),
    inset 0 0 5px rgba(255, 255, 255, 0.1);

  background-color: #1a1a1a;

  /* 상단 모서리에 아주 얇은 하이라이트 추가 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    z-index: 12;
  }
`;

export const CardFront = styled(CardFace)`
  z-index: 2;
`;

export const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
`;
