import { useCallback, useRef, useState, useMemo, RefObject } from 'react';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useScroll } from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { UPDATE_INTERVAL } from '@/components/HexViewer/hexViewerConstants';
import { calculateScrollbarTop } from '@/utils/hexViewer';

interface UseHexViewerYScrollProps {
  rowCount: number;
  visibleRows: number;
  maxFirstRow: number;
  canvasHeight: number;
  requestChunks: (
    startRow: number,
    currentFile: File,
    currentFileSize: number,
    currentVisibleRows: number
  ) => void;
  firstRowRef: RefObject<number>;
  rowHeight: number;
}

export const useHexViewerYScroll = ({
  rowCount,
  visibleRows,
  maxFirstRow,
  canvasHeight,
  requestChunks,
  firstRowRef,
  rowHeight,
}: UseHexViewerYScrollProps) => {
  const { activeKey, activeData } = useTab();
  const { scrollPositions, setScrollPositions } = useScroll();
  const { chunkWorker } = useWorker();

  const file = activeData?.file;
  const fileSize = file?.size || 0;

  // ===== States =====
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);

  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  // ===== Calculated Values =====
  const shouldShowScrollbar = rowCount > visibleRows && fileSize > 0;
  const scrollbarHeight = Math.max(30, (visibleRows / rowCount) * canvasHeight);
  const scrollbarTop = useMemo(
    () =>
      calculateScrollbarTop(
        scrollPositions[activeKey] ?? 0,
        maxFirstRow,
        canvasHeight,
        scrollbarHeight
      ),
    [scrollPositions, activeKey, maxFirstRow, canvasHeight, scrollbarHeight]
  );

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
        // ✅ 휠 스크롤 시에도 워커에 데이터 요청
        // 캐시에 없으면 워커가 processChunk를 실행합니다.
        if (file) {
          requestChunks(nextRow, file, fileSize, visibleRows + 20);
        }
      }
    },
    [
      firstRowRef,
      maxFirstRow,
      updateScrollPosition,
      requestChunks,
      file,
      fileSize,
      visibleRows,
    ]
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
        const rowDelta = -Math.round(deltaY / rowHeight);
        const nextRow = Math.max(
          0,
          Math.min(touchStartRowRef.current + rowDelta, maxFirstRow)
        );
        if (nextRow !== firstRowRef.current) {
          updateScrollPosition(nextRow);
          // ✅ 터치 스크롤 시에도 워커에 데이터 요청
          if (file) {
            requestChunks(nextRow, file, fileSize, visibleRows + 20);
          }
        }
      }
    },
    [
      scrollbarDragging,
      maxFirstRow,
      updateScrollPosition,
      firstRowRef,
      requestChunks,
      file,
      fileSize,
      visibleRows,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  }, []);

  // ===== 3. Scrollbar Drag =====
  const handleScrollbarStart = useCallback(
    (clientY: number) => {
      setScrollbarDragging(true);
      setScrollbarStartY(clientY);
      setScrollbarStartRow(firstRowRef.current);
      document.body.style.userSelect = 'none';
    },
    [firstRowRef]
  );

  const handleScrollbarEnd = useCallback(() => {
    setScrollbarDragging(false);
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
    if (!scrollbarDragging || !chunkWorker || !file) return;

    requestChunks(firstRowRef.current, file, fileSize, visibleRows + 100);

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
        const rowDelta = Math.round(
          (deltaY / totalScrollable) * (rowCount - visibleRows)
        );
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));

        if (nextRow !== firstRowRef.current) {
          // ✅ 큰 스크롤 점프 감지: 20줄 이상 이동하면 워커 큐 비우기
          const jumpDistance = Math.abs(nextRow - firstRowRef.current);
          if (jumpDistance > 20 && chunkWorker) {
            chunkWorker.postMessage({ type: 'CANCEL_ALL' });
          }

          updateScrollPosition(nextRow);
        }
        lastUpdateTime = currentTime;
        requestChunks(nextRow, file, fileSize, visibleRows + 50);
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
        const rowDelta = Math.round(
          (deltaY / totalScrollable) * (rowCount - visibleRows)
        );
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));

        if (nextRow !== firstRowRef.current) {
          // ✅ 큰 스크롤 점프 감지: 20줄 이상 이동하면 워커 큐 비우기
          const jumpDistance = Math.abs(nextRow - firstRowRef.current);
          if (jumpDistance > 20 && chunkWorker) {
            chunkWorker.postMessage({ type: 'CANCEL_ALL' });
          }

          updateScrollPosition(nextRow);
        }
        lastUpdateTime = currentTime;
        requestChunks(nextRow, file, fileSize, visibleRows + 50);
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
    chunkWorker,
    handleScrollbarEnd,
    firstRowRef,
  ]);

  return {
    shouldShowScrollbar,
    scrollbarHeight,
    scrollbarTop,
    scrollbarDragging,
    updateScrollPosition,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleScrollbarMouseDown,
    handleScrollbarTouchStart,
    scrollbarDragEffect,
  };
};
