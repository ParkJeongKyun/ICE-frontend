import { useCallback, useRef, useState } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext';
import { UPDATE_INTERVAL, LAYOUT } from '@/constants/hexViewer';

interface UseHexViewerScrollProps {
  rowCount: number;
  visibleRows: number;
  maxFirstRow: number;
  canvasHeight: number;
  scrollbarHeight: number;
  file: File | undefined;
  fileSize: number;
  requestChunks: (
    startRow: number,
    worker: Worker,
    currentFile: File,
    currentFileSize: number,
    currentVisibleRows: number
  ) => void;
  firstRowRef: React.MutableRefObject<number>;
}

export const useHexViewerScroll = ({
  rowCount,
  visibleRows,
  maxFirstRow,
  canvasHeight,
  scrollbarHeight,
  file,
  fileSize,
  requestChunks,
  firstRowRef,
}: UseHexViewerScrollProps) => {
  const { activeKey, setScrollPositions } = useTabData();
  const { fileWorker } = useWorker();

  // ===== States =====
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);
  const isDraggingRef = useRef(false);
  
  // 터치 스크롤용
  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  // ===== Common Scroll Update =====
  const updateScrollPosition = useCallback(
    (position: number) => {
      const clampedPosition = Math.max(0, Math.min(position, maxFirstRow));
      firstRowRef.current = clampedPosition;
      setScrollPositions((prev) => ({ ...prev, [activeKey]: clampedPosition }));
    },
    [activeKey, maxFirstRow, setScrollPositions, firstRowRef]
  );

  // ===== 1. Wheel Scroll =====
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const nextRow =
        e.deltaY > 0
          ? Math.min(firstRowRef.current + 1, maxFirstRow)
          : Math.max(firstRowRef.current - 1, 0);
      if (nextRow !== firstRowRef.current) {
        updateScrollPosition(nextRow);
      }
    },
    [firstRowRef, maxFirstRow, updateScrollPosition]
  );

  // ===== 2. Touch Scroll =====
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
        touchStartRowRef.current = firstRowRef.current;
      }
    },
    [firstRowRef]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (scrollbarDragging) return; // 스크롤바 드래그 중이면 무시
      if (
        e.touches.length === 1 &&
        touchStartYRef.current !== null &&
        touchStartRowRef.current !== null
      ) {
        const deltaY = e.touches[0].clientY - touchStartYRef.current;
        const rowDelta = -Math.round(deltaY / LAYOUT.rowHeight);
        const nextRow = Math.max(0, Math.min(touchStartRowRef.current + rowDelta, maxFirstRow));
        if (nextRow !== firstRowRef.current) {
          updateScrollPosition(nextRow);
        }
      }
    },
    [scrollbarDragging, maxFirstRow, updateScrollPosition, firstRowRef]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  }, []);

  // ===== 3. Scrollbar Drag =====
  const handleScrollbarStart = useCallback(
    (clientY: number) => {
      setScrollbarDragging(true);
      isDraggingRef.current = true;
      setScrollbarStartY(clientY);
      setScrollbarStartRow(firstRowRef.current);
      document.body.style.userSelect = 'none';
    },
    [firstRowRef]
  );

  const handleScrollbarEnd = useCallback(() => {
    setScrollbarDragging(false);
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
  }, []);

  const handleScrollbarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleScrollbarStart(e.clientY);
    },
    [handleScrollbarStart]
  );

  const handleScrollbarTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleScrollbarStart(e.touches[0].clientY);
      }
    },
    [handleScrollbarStart]
  );

  const scrollbarDragEffect = useCallback(() => {
    if (!scrollbarDragging || !fileWorker || !file) return;

    isDraggingRef.current = true;
    requestChunks(firstRowRef.current, fileWorker, file, fileSize, visibleRows + 100);

    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime < UPDATE_INTERVAL) return;

      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const deltaY = e.clientY - scrollbarStartY;
        const totalScrollable = canvasHeight - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round((deltaY / totalScrollable) * (rowCount - visibleRows));
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));

        if (nextRow !== firstRowRef.current) {
          updateScrollPosition(nextRow);
        }
        lastUpdateTime = currentTime;
        requestChunks(nextRow, fileWorker, file, fileSize, visibleRows + 50);
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();

      const currentTime = Date.now();
      if (currentTime - lastUpdateTime < UPDATE_INTERVAL) return;

      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const deltaY = e.touches[0].clientY - scrollbarStartY;
        const totalScrollable = canvasHeight - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round((deltaY / totalScrollable) * (rowCount - visibleRows));
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));

        if (nextRow !== firstRowRef.current) {
          updateScrollPosition(nextRow);
        }
        lastUpdateTime = currentTime;
        requestChunks(nextRow, fileWorker, file, fileSize, visibleRows + 50);
      });
    };

    const handleEnd = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      handleScrollbarEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [
    scrollbarDragging,
    scrollbarStartY,
    scrollbarStartRow,
    rowCount,
    visibleRows,
    maxFirstRow,
    canvasHeight,
    scrollbarHeight,
    file,
    fileSize,
    requestChunks,
    updateScrollPosition,
    fileWorker,
    handleScrollbarEnd,
    firstRowRef,
  ]);

  return {
    // 스크롤 상태
    updateScrollPosition,
    scrollbarDragging,
    
    // 휠 스크롤
    handleWheel,
    
    // 터치 스크롤
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // 스크롤바
    handleScrollbarMouseDown,
    handleScrollbarTouchStart,
    scrollbarDragEffect,
  };
};
