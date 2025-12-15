import { useCallback, useRef, useState } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';
import { RENDER_INTERVAL, UPDATE_INTERVAL } from '@/constants/hexViewer';

interface UseHexViewerScrollProps {
  activeKey: TabKey;
  rowCount: number;
  visibleRows: number;
  maxFirstRow: number;
  canvasHeight: number;
  scrollbarHeight: number;
  file: File | undefined;
  fileSize: number;
  fileWorker: Worker | null;
  requestChunks: (
    startRow: number,
    worker: Worker,
    currentFile: File,
    currentFileSize: number,
    currentVisibleRows: number
  ) => void;
  directRenderRef: React.MutableRefObject<() => void>;
  firstRowRef: React.MutableRefObject<number>; // ✅ 외부에서 받음
}

export const useHexViewerScroll = ({
  activeKey,
  rowCount,
  visibleRows,
  maxFirstRow,
  canvasHeight,
  scrollbarHeight,
  file,
  fileSize,
  fileWorker,
  requestChunks,
  directRenderRef,
  firstRowRef, // ✅ 파라미터로 받음
}: UseHexViewerScrollProps) => {
  const { setScrollPositions } = useTabData();
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);
  const isDraggingRef = useRef(false);

  const updateScrollPosition = useCallback(
    (position: number) => {
      firstRowRef.current = position;
      setScrollPositions((prev) => ({ ...prev, [activeKey]: position }));
    },
    [activeKey, setScrollPositions]
  );

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

  // ✅ 스크롤바 드래그 로직
  const scrollbarDragEffect = useCallback(() => {
    if (!scrollbarDragging || !fileWorker || !file) return;

    isDraggingRef.current = true;

    requestChunks(firstRowRef.current, fileWorker, file, fileSize, visibleRows + 100);

    let lastRenderTime = 0;
    let periodicRafId: number | null = null;

    const periodicRender = (timestamp: number) => {
      if (!isDraggingRef.current) return;
      if (timestamp - lastRenderTime >= RENDER_INTERVAL) {
        directRenderRef.current();
        lastRenderTime = timestamp;
      }
      periodicRafId = requestAnimationFrame(periodicRender);
    };

    periodicRafId = requestAnimationFrame(periodicRender);

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
      if (periodicRafId !== null) cancelAnimationFrame(periodicRafId);
      handleScrollbarEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (periodicRafId !== null) cancelAnimationFrame(periodicRafId);
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
    directRenderRef,
  ]);

  return {
    updateScrollPosition,
    scrollbarDragging,
    handleScrollbarMouseDown,
    handleScrollbarTouchStart,
    scrollbarDragEffect,
  };
};
