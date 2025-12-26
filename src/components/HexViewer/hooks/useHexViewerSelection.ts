import { RefObject, useCallback, useState } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { LAYOUT, HEX_START_X, ASCII_START_X, MAX_COPY_SIZE, COPY_CHUNK_SIZE } from '@/constants/hexViewer';

interface UseHexViewerSelectionProps {
  firstRowRef: RefObject<number>;
}

export const useHexViewerSelection = ({
  firstRowRef,
}: UseHexViewerSelectionProps) => {
  const { activeKey, selectionStates, setSelectionStates, activeData } = useTabData();
  
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / LAYOUT.bytesPerRow);
  
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

      if (x >= HEX_START_X && x < HEX_START_X + LAYOUT.bytesPerRow * LAYOUT.hexByteWidth) {
        const col = Math.floor((x - HEX_START_X) / LAYOUT.hexByteWidth);
        if (col < 0 || col >= LAYOUT.bytesPerRow) return null;
        const idx = row * LAYOUT.bytesPerRow + col;
        return idx >= fileSize ? null : idx;
      }

      if (x >= ASCII_START_X && x < ASCII_START_X + LAYOUT.bytesPerRow * LAYOUT.asciiCharWidth) {
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

  const handleCopy = useCallback(
    async (format: 'hex' | 'text') => {
      const current = selectionStates[activeKey];
      if (current?.start !== null && current?.end !== null && file) {
        const start = Math.min(current.start, current.end);
        const end = Math.max(current.start, current.end) + 1;
        const actualEnd = start + Math.min(end - start, MAX_COPY_SIZE);

        try {
          const arrayBuffer = await file.slice(start, actualEnd).arrayBuffer();
          const selected = new Uint8Array(arrayBuffer);
          let result = '';

          for (let i = 0; i < selected.length; i += COPY_CHUNK_SIZE) {
            const chunk = selected.slice(i, Math.min(i + COPY_CHUNK_SIZE, selected.length));
            if (format === 'hex') {
              result += Array.from(chunk).map((b) => b.toString(16).padStart(2, '0')).join(' ') + ' ';
            } else {
              result += Array.from(chunk).map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.')).join('');
            }
          }
          await navigator.clipboard.writeText(format === 'hex' ? result.trim() : result);
        } catch (error) {
          console.error(`${format.toUpperCase()} 복사 실패:`, error);
          alert('복사 실패: ' + (error as Error).message);
        }
      }
      setContextMenu(null);
    },
    [selectionStates, activeKey, file]
  );

  const handleCopyHex = useCallback(() => handleCopy('hex'), [handleCopy]);
  const handleCopyText = useCallback(() => handleCopy('text'), [handleCopy]);

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
    
    // Copy
    handleCopyHex,
    handleCopyText,
  };
};
