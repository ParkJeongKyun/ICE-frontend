import styled, { createGlobalStyle } from 'styled-components';

// 스크롤 완전 차단 글로벌 스타일 추가
export const NoScroll = createGlobalStyle`
  html, body {
    overflow: hidden !important;
    height: 100vh;
    width: 100vw;
    overscroll-behavior: none;
    touch-action: none;
  }
`;

export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden !important;
  position: relative;
  background: var(--main-bg-color);

  @media (max-width: 600px) {
    padding-bottom: 120px;
    min-height: 100vh;
    height: 100vh;
    overflow: hidden !important;
  }
`;

export const GameWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
`;

export const BoardContainer = styled.div`
  background-color: var(--main-bg-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  @media (max-width: 600px) {
    border-width: 1px;
    box-shadow: none;
  }
`;

export const Board = styled.div`
  display: grid;
  grid-template-rows: repeat(20, 20px);
  grid-template-columns: repeat(10, 20px);
  gap: 1px;
  padding: 4px;
  background-color: var(--main-hover-color);
  @media (max-width: 600px) {
    grid-template-rows: repeat(20, 13px);
    grid-template-columns: repeat(10, 13px);
    padding: 1px;
  }
`;

export const Cell = styled.div<{
  $color: string | null;
  $isActive: boolean;
  $isGhost?: boolean;
}>`
  width: 100%;
  height: 100%;
  border-radius: 2px;
  background-color: ${(props) =>
    props.$isGhost
      ? 'transparent'
      : props.$color
        ? props.$color
        : 'var(--main-hover-color_1)'};
  border: ${(props) =>
    props.$isGhost
      ? `1px dashed ${props.$color || 'var(--ice-main-color)'}`
      : props.$isActive
        ? '1px solid var(--main-hover-line-color)'
        : '1px solid var(--main-line-color)'};
  box-shadow: ${(props) =>
    props.$isActive && !props.$isGhost
      ? 'inset 0 0 5px rgba(255,255,255,0.3)'
      : 'none'};
  opacity: ${(props) => (props.$isGhost ? 0.5 : 1)};
  transition: background-color 0.1s ease;
  @media (max-width: 600px) {
    border-radius: 1px;
    box-shadow: none;
  }
`;

export const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  @media (max-width: 600px) {
    gap: 8px;
  }
`;

export const NextPieceContainer = styled.div`
  background-color: var(--main-bg-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
    padding: 6px;
  }
`;

export const NextPieceTitle = styled.h3`
  margin: 0 0 10px 0;
  color: var(--ice-main-color);
  font-size: 1.1rem;
  @media (max-width: 600px) {
    font-size: 0.85rem;
    margin-bottom: 5px;
  }
`;

export const NextPieceBoard = styled.div`
  display: grid;
  grid-template-rows: repeat(4, 18px);
  grid-template-columns: repeat(4, 18px);
  gap: 1px;
  @media (max-width: 600px) {
    grid-template-rows: repeat(4, 13px);
    grid-template-columns: repeat(4, 13px);
  }
`;

export const ScorePanel = styled.div`
  background-color: var(--main-bg-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  padding: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
    padding: 6px;
  }
`;

export const ScoreTitle = styled.h3`
  margin: 0 0 8px 0;
  color: var(--ice-main-color);
  font-size: 1.1rem;
  @media (max-width: 600px) {
    font-size: 0.85rem;
    margin-bottom: 3px;
  }
`;

export const ScoreValue = styled.p`
  font-size: 1.3rem;
  margin: 0;
  color: var(--ice-main-color_4);
  @media (max-width: 600px) {
    font-size: 0.95rem;
  }
`;

export const GameControls = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  @media (max-width: 600px) {
    margin-top: 8px;
    gap: 4px;
  }
`;

export const Button = styled.button`
  background-color: var(--main-hover-color);
  color: var(--ice-main-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  padding: 7px 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--main-hover-color_1);
    border-color: var(--ice-main-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--main-disabled-color);
  }

  @media (max-width: 600px) {
    padding: 4px 8px;
    font-size: 0.85rem;
  }
`;

export const GameTitle = styled.h1`
  color: var(--ice-main-color);
  font-size: 2.2rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(80, 192, 255, 0.5);
  @media (max-width: 600px) {
    font-size: 1.3rem;
    margin-bottom: 4px;
  }
`;

export const GameOver = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 21, 32, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

export const GameOverText = styled.h2`
  color: var(--ice-main-color_1);
  font-size: 3rem;
  margin-bottom: 20px;
`;

// 모바일 컨트롤 버튼 스타일
export const MobileControls = styled.div`
  position: fixed;
  left: 0;
  bottom: 20px;
  width: 100vw;
  background: transparent; // 배경 완전 투명
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1; // 기존 20에서 낮춤
  padding: 10px 0 6px 0;
  box-shadow: none;
  border-radius: 18px 18px 0 0;
  pointer-events: none; // 영역 자체는 클릭 불가
  @media (min-width: 601px) {
    display: none;
  }
`;

export const MobileRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 18px;
  margin: 6px 0;
`;

export const MobileButton = styled.button`
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  background: rgba(80, 192, 255, 0.18); // 투명도 있는 단색
  color: var(--ice-main-color_2);
  border: 1.5px solid var(--ice-main-color_1);
  border-radius: 50%;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; // 버튼만 클릭 가능

  &:active {
    background: rgba(80, 192, 255, 0.32);
    color: var(--ice-main-color);
    border-color: var(--main-color_1);
  }
`;
