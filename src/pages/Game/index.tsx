import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as S from './index.styles';

// 테트로미노 색상 (CSS 변수 활용)
const TETROMINO_COLORS = [
  'var(--ice-main-color)', // I 블록
  'var(--ice-main-color_1)', // J 블록
  'var(--ice-main-color_2)', // L 블록
  'var(--ice-main-color_3)', // O 블록
  'var(--main-bg-color_1)', // S 블록
  'var(--main-color_1)', // T 블록
  'var(--main-hover-line-color)', // Z 블록
];

// 테트로미노 모양 정의
const TETROMINOS = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

type TetrominoType = keyof typeof TETROMINOS;
type Position = { x: number; y: number };
type RotateFunc = (matrix: number[][]) => number[][];

// 보드 크기 정의
const BOARD_HEIGHT = 20;
const BOARD_WIDTH = 10;

// 테트로미노 회전 함수
const rotate: RotateFunc = (matrix) => {
  const N = matrix.length;
  const result = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      result[j][N - 1 - i] = matrix[i][j];
    }
  }

  return result;
};

// 초기 빈 보드 생성 함수
const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const Game: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    type: TetrominoType;
    position: Position;
    color: string;
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<{
    shape: number[][];
    type: TetrominoType;
    color: string;
  } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // 랜덤 테트로미노 생성 함수
  const getRandomTetromino = useCallback(() => {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const colorIndex = types.indexOf(randomType);

    return {
      shape: TETROMINOS[randomType],
      type: randomType,
      color: TETROMINO_COLORS[colorIndex],
    };
  }, []);

  // 새 테트로미노 생성 함수
  const generateNewPiece = useCallback(() => {
    if (nextPiece) {
      const startX =
        Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPiece.shape[0].length / 2);
      setCurrentPiece({
        ...nextPiece,
        position: { x: startX, y: 0 },
      });
      setNextPiece(getRandomTetromino());
    } else {
      const newTetromino = getRandomTetromino();
      const startX =
        Math.floor(BOARD_WIDTH / 2) -
        Math.floor(newTetromino.shape[0].length / 2);
      setCurrentPiece({
        ...newTetromino,
        position: { x: startX, y: 0 },
      });
      setNextPiece(getRandomTetromino());
    }
  }, [nextPiece, getRandomTetromino]);

  // 충돌 감지 함수
  const checkCollision = useCallback(
    (shape: number[][], position: Position) => {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardX = position.x + x;
            const boardY = position.y + y;

            // 경계 검사
            if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
              return true;
            }

            // 다른 블록과의 충돌 검사
            if (boardY >= 0 && board[boardY][boardX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  // 테트로미노 이동 함수
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || isPaused || isGameOver) return;

      const newPosition = {
        x: currentPiece.position.x + dx,
        y: currentPiece.position.y + dy,
      };

      if (!checkCollision(currentPiece.shape, newPosition)) {
        setCurrentPiece({
          ...currentPiece,
          position: newPosition,
        });
        return true;
      }
      return false;
    },
    [currentPiece, checkCollision, isPaused, isGameOver]
  );

  // 테트로미노 회전 함수
  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;

    const rotatedShape = rotate(currentPiece.shape);

    if (!checkCollision(rotatedShape, currentPiece.position)) {
      setCurrentPiece({
        ...currentPiece,
        shape: rotatedShape,
      });
    } else {
      // 벽 근처에서 회전 처리 (벽걸림 해소)
      const kicks = [-1, 1, -2, 2]; // 왼쪽, 오른쪽, 더 왼쪽, 더 오른쪽

      for (const kick of kicks) {
        const newPosition = {
          ...currentPiece.position,
          x: currentPiece.position.x + kick,
        };

        if (!checkCollision(rotatedShape, newPosition)) {
          setCurrentPiece({
            ...currentPiece,
            shape: rotatedShape,
            position: newPosition,
          });
          return;
        }
      }
    }
  }, [currentPiece, checkCollision, isPaused, isGameOver]);

  // 테트로미노 하드 드롭 함수 (한번에 끝까지 내리기)
  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;

    let newY = currentPiece.position.y;

    while (
      !checkCollision(currentPiece.shape, {
        x: currentPiece.position.x,
        y: newY + 1,
      })
    ) {
      newY++;
    }

    setCurrentPiece({
      ...currentPiece,
      position: { ...currentPiece.position, y: newY },
    });

    // 바로 고정시키기
    mergePiece();
  }, [currentPiece, checkCollision, isPaused, isGameOver]);

  // 보드에 테트로미노 합치기
  const mergePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = [...board];

    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + currentPiece.position.y;
          const boardX = x + currentPiece.position.x;

          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });

    setBoard(newBoard);

    // 완성된 라인 체크 및 제거
    const completedLines = newBoard.reduce((acc, row, idx) => {
      if (row.every((cell) => cell !== null)) {
        return [...acc, idx];
      }
      return acc;
    }, [] as number[]);

    if (completedLines.length > 0) {
      // 점수 추가
      const linePoints = [40, 100, 300, 1200]; // 1, 2, 3, 4 라인 동시 제거 점수
      const additionalScore = linePoints[completedLines.length - 1] * level;
      setScore((prev) => prev + additionalScore);

      // 레벨업 체크 (10점당 1레벨)
      const newScore = score + additionalScore;
      const newLevel = Math.floor(newScore / 1000) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }

      // 완성된 라인 제거
      const newBoardAfterLineRemoval = newBoard.slice();
      completedLines.forEach((lineIdx) => {
        newBoardAfterLineRemoval.splice(lineIdx, 1);
        newBoardAfterLineRemoval.unshift(Array(BOARD_WIDTH).fill(null));
      });

      setBoard(newBoardAfterLineRemoval);
    }

    // 새 테트로미노 생성
    generateNewPiece();

    // 게임 오버 체크
    if (newBoard[0].some((cell) => cell !== null)) {
      setIsGameOver(true);
      if (gameInterval.current) {
        clearInterval(gameInterval.current);
        gameInterval.current = null;
      }
    }
  }, [currentPiece, board, generateNewPiece, level, score]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movePiece, rotatePiece, hardDrop, isGameOver]);

  // 자동 하강 타이머
  useEffect(() => {
    if (!isPaused && !isGameOver && currentPiece) {
      const speed = Math.max(100, 1000 - (level - 1) * 100); // 레벨에 따라 속도 증가

      gameInterval.current = setInterval(() => {
        const moved = movePiece(0, 1);
        if (!moved) {
          mergePiece();
        }
      }, speed);

      return () => {
        if (gameInterval.current) {
          clearInterval(gameInterval.current);
          gameInterval.current = null;
        }
      };
    }
  }, [currentPiece, isPaused, isGameOver, level, movePiece, mergePiece]);

  // 게임 시작 시 초기화
  useEffect(() => {
    startGame();
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    generateNewPiece();
  };

  // 현재 테트로미노를 보드에 그리기
  const renderBoard = () => {
    const boardWithCurrentPiece = board.map((row) => [...row]);

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = y + currentPiece.position.y;
            const boardX = x + currentPiece.position.x;

            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              boardWithCurrentPiece[boardY][boardX] = currentPiece.color;
            }
          }
        });
      });
    }

    return (
      <S.Board>
        {boardWithCurrentPiece.map((row, y) =>
          row.map((cell, x) => (
            <S.Cell key={`${y}-${x}`} $color={cell} $isActive={cell !== null} />
          ))
        )}
      </S.Board>
    );
  };

  // 다음 테트로미노 표시
  const renderNextPiece = () => {
    if (!nextPiece) return null;

    const grid = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));

    nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          grid[y][x] = nextPiece.color;
        }
      });
    });

    return (
      <S.NextPieceBoard>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <S.Cell
              key={`next-${y}-${x}`}
              $color={cell}
              $isActive={cell !== null}
            />
          ))
        )}
      </S.NextPieceBoard>
    );
  };

  return (
    <S.GameContainer>
      <S.GameTitle>ICE Tetris</S.GameTitle>

      <S.GameWrapper>
        <S.BoardContainer>{renderBoard()}</S.BoardContainer>

        <S.SidePanel>
          <S.NextPieceContainer>
            <S.NextPieceTitle>다음 블록</S.NextPieceTitle>
            {renderNextPiece()}
          </S.NextPieceContainer>

          <S.ScorePanel>
            <S.ScoreTitle>점수</S.ScoreTitle>
            <S.ScoreValue>{score}</S.ScoreValue>
          </S.ScorePanel>

          <S.ScorePanel>
            <S.ScoreTitle>레벨</S.ScoreTitle>
            <S.ScoreValue>{level}</S.ScoreValue>
          </S.ScorePanel>

          <S.GameControls>
            <S.Button onClick={togglePause} disabled={isGameOver}>
              {isPaused ? '계속하기' : '일시정지'}
            </S.Button>
            <S.Button onClick={startGame}>새 게임</S.Button>
          </S.GameControls>
        </S.SidePanel>
      </S.GameWrapper>

      {isGameOver && (
        <S.GameOver>
          <S.GameOverText>Game Over</S.GameOverText>
          <S.Button onClick={startGame}>다시 시작</S.Button>
        </S.GameOver>
      )}
    </S.GameContainer>
  );
};

export default Game;
