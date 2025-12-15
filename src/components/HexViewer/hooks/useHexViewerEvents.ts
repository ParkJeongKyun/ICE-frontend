import { useCallback, useState, useRef } from 'react';
import { LAYOUT } from '@/constants/hexViewer';

interface UseHexViewerEventsProps {
  firstRowRef: React.MutableRefObject<number>;
  rowCount: number;
  fileSize: number;
  maxFirstRow: number;
  handleScrollPositionUpdate: (position: number) => void;
  updateSelection: (start: number | null, end: number | null) => void;
  getByteIndexFromMouse: (x: number, y: number) => number | null;
  selectionStates: any;
  activeKey: string;
  scrollbarDragging: boolean;
}

export const useHexViewerEvents = ({
  firstRowRef,
  rowCount,
  fileSize,
  maxFirstRow,
  handleScrollPositionUpdate,
  updateSelection,
  getByteIndexFromMouse,
  selectionStates,
  activeKey,
  scrollbarDragging,
}: UseHexViewerEventsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const nextRow =
        e.deltaY > 0
          ? Math.min(firstRowRef.current + 1, maxFirstRow)
          : Math.max(firstRowRef.current - 1, 0);
      if (nextRow !== firstRowRef.current) handleScrollPositionUpdate(nextRow);
    },
    [firstRowRef, maxFirstRow, handleScrollPositionUpdate]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const idx = getByteIndexFromMouse(e.clientX - rect.left, e.clientY - rect.top);
      if (idx !== null) {
        setIsDragging(true);
        updateSelection(idx, idx);
      }
    },
    [getByteIndexFromMouse, updateSelection]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const idx = getByteIndexFromMouse(e.clientX - rect.left, e.clientY - rect.top);
      if (idx !== null) {
        const current = selectionStates[activeKey];
        if (current?.start !== null) updateSelection(current.start, idx);
      }
    },
    [isDragging, getByteIndexFromMouse, selectionStates, activeKey, updateSelection]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

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
      if (scrollbarDragging) return;
      if (
        e.touches.length === 1 &&
        touchStartYRef.current !== null &&
        touchStartRowRef.current !== null
      ) {
        const deltaY = e.touches[0].clientY - touchStartYRef.current;
        const rowDelta = -Math.round(deltaY / LAYOUT.rowHeight);
        const nextRow = Math.max(0, Math.min(touchStartRowRef.current + rowDelta, maxFirstRow));
        if (nextRow !== firstRowRef.current) handleScrollPositionUpdate(nextRow);
      }
    },
    [scrollbarDragging, maxFirstRow, handleScrollPositionUpdate, firstRowRef]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  }, []);

  return {
    isDragging,
    setIsDragging,
    contextMenu,
    setContextMenu,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    closeContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
