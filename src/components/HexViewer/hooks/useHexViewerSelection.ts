import { useCallback, useState } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';
import { LAYOUT, HEX_START_X, ASCII_START_X } from '@/constants/hexViewer';

interface UseHexViewerSelectionProps {
  activeKey: TabKey;
  firstRowRef: React.MutableRefObject<number>;
  fileSize: number;
  rowCount: number;
  selectionStates: any;
}

export const useHexViewerSelection = ({
  activeKey,
  firstRowRef,
  fileSize,
  rowCount,
  selectionStates,
}: UseHexViewerSelectionProps) => {
  const { setSelectionStates } = useTabData();
  
  // ===== Selection State =====
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // ===== Selection Update =====
  const updateSelection = useCallback(
    (start: number | null, end: number | null) => {
      setSelectionStates((prev) => ({ ...prev, [activeKey]: { start, end } }));
    },
    [activeKey, setSelectionStates]
  );

  // ===== Byte Index Calculation =====
  const getByteIndexFromMouse = useCallback(
    (x: number, y: number): number | null => {
      const row = firstRowRef.current + Math.floor(y / LAYOUT.rowHeight);
      if (row < 0 || row >= rowCount) return null;

      if (
        x >= HEX_START_X &&
        x < HEX_START_X + LAYOUT.bytesPerRow * LAYOUT.hexByteWidth
      ) {
        const col = Math.floor((x - HEX_START_X) / LAYOUT.hexByteWidth);
        if (col < 0 || col >= LAYOUT.bytesPerRow) return null;
        const idx = row * LAYOUT.bytesPerRow + col;
        return idx >= fileSize ? null : idx;
      }

      if (
        x >= ASCII_START_X &&
        x < ASCII_START_X + LAYOUT.bytesPerRow * LAYOUT.asciiCharWidth
      ) {
        const col = Math.floor((x - ASCII_START_X) / LAYOUT.asciiCharWidth);
        if (col < 0 || col >= LAYOUT.bytesPerRow) return null;
        const idx = row * LAYOUT.bytesPerRow + col;
        return idx >= fileSize ? null : idx;
      }

      return null;
    },
    [firstRowRef, rowCount, fileSize]
  );

  // ===== Mouse Events =====
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

  // ===== Context Menu =====
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  return {
    // Selection state
    isDragging,
    updateSelection,
    
    // Context menu
    contextMenu,
    setContextMenu,
    closeContextMenu,
    
    // Mouse events
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
  };
};
