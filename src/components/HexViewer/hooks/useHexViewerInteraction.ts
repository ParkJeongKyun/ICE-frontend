import { useCallback, useState } from 'react';

interface UseHexViewerInteractionProps {
  getByteIndexFromMouse: (x: number, y: number) => number | null;
  updateSelection: (start: number | null, end: number | null) => void;
  selectionStates: any;
  activeKey: string;
}

export const useHexViewerInteraction = ({
  getByteIndexFromMouse,
  updateSelection,
  selectionStates,
  activeKey,
}: UseHexViewerInteractionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

  return {
    isDragging,
    contextMenu,
    setContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    closeContextMenu,
  };
};
