import styled from 'styled-components';

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
  }

  .glare {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    mix-blend-mode: overlay;
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
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1a1a1a;
`;

export const CardFront = styled(CardFace)`
  z-index: 2;
`;

export const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
`;
