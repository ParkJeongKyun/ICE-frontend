import { useCallback } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';
import { LAYOUT, HEX_START_X, ASCII_START_X } from '@/constants/hexViewer';

interface UseHexViewerSelectionProps {
  activeKey: TabKey;
  firstRowRef: React.MutableRefObject<number>;
  fileSize: number;
  rowCount: number;
}

export const useHexViewerSelection = ({
  activeKey,
  firstRowRef,
  fileSize,
  rowCount,
}: UseHexViewerSelectionProps) => {
  const { setSelectionStates } = useTabData();

  const updateSelection = useCallback(
    (start: number | null, end: number | null) => {
      setSelectionStates((prev) => ({ ...prev, [activeKey]: { start, end } }));
    },
    [activeKey, setSelectionStates]
  );

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

  return { updateSelection, getByteIndexFromMouse };
};
