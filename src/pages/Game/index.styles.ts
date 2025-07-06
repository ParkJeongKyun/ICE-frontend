import styled from 'styled-components';

export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--main-color);
`;

export const GameWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

export const BoardContainer = styled.div`
  background-color: var(--main-bg-color);
  border: 4px solid var(--main-line-color);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

export const Board = styled.div`
  display: grid;
  grid-template-rows: repeat(20, 25px);
  grid-template-columns: repeat(10, 25px);
  gap: 1px;
  padding: 5px;
  background-color: var(--main-hover-color);
`;

export const Cell = styled.div<{ $color: string | null; $isActive: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 2px;
  background-color: ${(props) =>
    props.$color ? props.$color : 'var(--main-hover-color_1)'};
  border: ${(props) =>
    props.$isActive
      ? '1px solid var(--main-hover-line-color)'
      : '1px solid var(--main-line-color)'};
  box-shadow: ${(props) =>
    props.$isActive ? 'inset 0 0 5px rgba(255, 255, 255, 0.3)' : 'none'};
  transition: background-color 0.1s ease;
`;

export const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const NextPieceContainer = styled.div`
  background-color: var(--main-bg-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const NextPieceTitle = styled.h3`
  margin: 0 0 10px 0;
  color: var(--ice-main-color);
`;

export const NextPieceBoard = styled.div`
  display: grid;
  grid-template-rows: repeat(4, 20px);
  grid-template-columns: repeat(4, 20px);
  gap: 1px;
`;

export const ScorePanel = styled.div`
  background-color: var(--main-bg-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ScoreTitle = styled.h3`
  margin: 0 0 10px 0;
  color: var(--ice-main-color);
`;

export const ScoreValue = styled.p`
  font-size: 1.5rem;
  margin: 0;
  color: var(--ice-main-color_4);
`;

export const GameControls = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`;

export const Button = styled.button`
  background-color: var(--main-hover-color);
  color: var(--ice-main-color);
  border: 2px solid var(--main-line-color);
  border-radius: 4px;
  padding: 8px 16px;
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
`;

export const GameTitle = styled.h1`
  color: var(--ice-main-color);
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(80, 192, 255, 0.5);
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
