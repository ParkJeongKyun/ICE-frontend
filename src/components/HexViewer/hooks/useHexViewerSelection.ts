import { RefObject, useCallback, useRef, useEffect, useState } from 'react';
import { useTab } from '@/contexts/TabDataContext';
import { useSelection } from '@/contexts/TabDataContext';
import eventBus from '@/utils/eventBus';
import {
  LAYOUT,
  HEX_START_X,
  ASCII_START_X,
  MAX_COPY_SIZE,
  COPY_CHUNK_SIZE,
} from '@/constants/hexViewer';

// ===== Type Definitions =====
interface ContextMenuState {
  x: number;
  y: number;
}

interface UseHexViewerSelectionProps {
  firstRowRef: RefObject<number>;
  fileSize: number;
  rowCount: number;
}

export const useHexViewerSelection = ({
  firstRowRef,
  fileSize,
  rowCount,
}: UseHexViewerSelectionProps) => {
  const { activeKey, activeData } = useTab();
  const { selectionStates, setSelectionStates } = useSelection();

  const file = activeData?.file;

  // ===== Local UI State =====
  const contextMenuRef = useRef<ContextMenuState | null>(null);

  // Context에서 현재 선택 상태 가져오기
  const selection = selectionStates[activeKey] || {
    cursor: null,
    start: null,
    end: null,
    isDragging: false,
    dragStart: null,
    selectedBytes: undefined,
  };

  // ===== Selection State Update =====
  const updateSelectionState = useCallback(
    (updates: Partial<typeof selection>) => {
      setSelectionStates((prev) => {
        const current = prev[activeKey];
        if (!current) {
          return {
            ...prev,
            [activeKey]: { ...selection, ...updates },
          };
        }

        // 변경 감지: 실제 변경이 있을 때만 업데이트
        const hasChanged = Object.entries(updates).some(
          ([key, value]) => current[key as keyof typeof current] !== value
        );

        if (!hasChanged) return prev;

        return {
          ...prev,
          [activeKey]: { ...current, ...updates },
        };
      });
    },
    [activeKey, selection, setSelectionStates]
  );

  // ===== Byte Index from Mouse Position =====
  const getByteIndexFromMouse = useCallback(
    (x: number, y: number): number | null => {
      const row = firstRowRef.current + Math.floor(y / LAYOUT.rowHeight);
      if (row < 0 || row >= rowCount) return null;

      // Check HEX region
      if (
        x >= HEX_START_X &&
        x < HEX_START_X + LAYOUT.bytesPerRow * LAYOUT.hexByteWidth
      ) {
        const col = Math.floor((x - HEX_START_X) / LAYOUT.hexByteWidth);
        if (col < 0 || col >= LAYOUT.bytesPerRow) return null;
        return row * LAYOUT.bytesPerRow + col < fileSize
          ? row * LAYOUT.bytesPerRow + col
          : null;
      }

      // Check ASCII region
      if (
        x >= ASCII_START_X &&
        x < ASCII_START_X + LAYOUT.bytesPerRow * LAYOUT.asciiCharWidth
      ) {
        const col = Math.floor((x - ASCII_START_X) / LAYOUT.asciiCharWidth);
        if (col < 0 || col >= LAYOUT.bytesPerRow) return null;
        return row * LAYOUT.bytesPerRow + col < fileSize
          ? row * LAYOUT.bytesPerRow + col
          : null;
      }

      return null;
    },
    [fileSize, rowCount, firstRowRef]
  );

  useEffect(() => {
    const readBytes = async () => {
      if (selection.start === null || selection.end === null || !file) {
        return;
      }

      try {
        const s = Math.max(0, Math.min(selection.start, selection.end));
        const length = Math.min(16, fileSize - s);
        if (length > 0) {
          const buf = await file.slice(s, s + length).arrayBuffer();
          updateSelectionState({ selectedBytes: new Uint8Array(buf) });
        }
      } catch (error) {
        console.error('Failed to read selected bytes:', error);
      }
    };

    readBytes();
  }, [selection.start, selection.end, file, fileSize, updateSelectionState]);

  // ===== Mouse Events =====
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const idx = getByteIndexFromMouse(
        e.clientX - rect.left,
        e.clientY - rect.top
      );

      if (idx === null) return;

      if (e.shiftKey) {
        const start = selection.start ?? idx;
        updateSelectionState({
          start,
          end: idx,
          cursor: idx,
          isDragging: false,
          dragStart: null,
        });
      } else {
        updateSelectionState({
          cursor: idx,
          start: idx,
          end: idx,
          isDragging: true,
          dragStart: idx,
        });
      }
    },
    [getByteIndexFromMouse, selection.start, updateSelectionState]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selection.isDragging) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const idx = getByteIndexFromMouse(
        e.clientX - rect.left,
        e.clientY - rect.top
      );

      if (idx !== null) {
        updateSelectionState({ cursor: idx, end: idx });
      }
    },
    [selection.isDragging, getByteIndexFromMouse, updateSelectionState]
  );

  const handleMouseUp = useCallback(() => {
    if (
      selection.isDragging &&
      selection.start !== null &&
      selection.end !== null
    ) {
      updateSelectionState({ isDragging: false, dragStart: null });
    }
  }, [
    selection.isDragging,
    selection.start,
    selection.end,
    updateSelectionState,
  ]);

  // ===== Context Menu =====
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    let y = e.clientY;
    if (y + 100 > window.innerHeight) y = window.innerHeight - 100;
    contextMenuRef.current = { x: e.clientX, y };
  }, []);

  const closeContextMenu = useCallback(() => {
    contextMenuRef.current = null;
  }, []);

  // ===== Copy Operations =====
  const handleCopy = useCallback(
    async (format: 'hex' | 'text') => {
      if (selection.start === null || selection.end === null || !file) return;

      const start = Math.min(selection.start, selection.end);
      const end = Math.max(selection.start, selection.end) + 1;
      const actualEnd = start + Math.min(end - start, MAX_COPY_SIZE);

      try {
        const arrayBuffer = await file.slice(start, actualEnd).arrayBuffer();
        const selected = new Uint8Array(arrayBuffer);
        let result = '';

        for (let i = 0; i < selected.length; i += COPY_CHUNK_SIZE) {
          const chunk = selected.slice(
            i,
            Math.min(i + COPY_CHUNK_SIZE, selected.length)
          );
          result +=
            format === 'hex'
              ? Array.from(chunk)
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join(' ') + ' '
              : Array.from(chunk)
                  .map((b) =>
                    b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'
                  )
                  .join('');
        }

        await navigator.clipboard.writeText(
          format === 'hex' ? result.trim() : result
        );
        eventBus.emit('toast', { code: 'COPY_SUCCESS' });
      } catch (error) {
        console.error(`${format.toUpperCase()} copy failed:`, error);
        eventBus.emit('toast', { code: 'COPY_FAILED' });
      }

      contextMenuRef.current = null;
    },
    [selection.start, selection.end, file]
  );

  const handleCopyHex = useCallback(() => handleCopy('hex'), [handleCopy]);
  const handleCopyText = useCallback(() => handleCopy('text'), [handleCopy]);
  const handleCopyOffset = useCallback(async () => {
    if (selection.start === null || selection.end === null) return;

    const offset = Math.min(selection.start, selection.end);
    try {
      await navigator.clipboard.writeText(offset.toString(16).toUpperCase());
      eventBus.emit('toast', { code: 'COPY_SUCCESS' });
    } catch (error) {
      console.error('Failed to copy offset:', error);
      eventBus.emit('toast', { code: 'COPY_FAILED' });
    }
    contextMenuRef.current = null;
  }, [selection.start, selection.end]);

  // ===== Keyboard Navigation =====
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { key } = e;
      if (
        ![
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
        ].includes(key)
      )
        return;

      e.preventDefault();

      const cursor = selection.cursor ?? 0;
      let newCursor = cursor;

      const keyActions: Record<string, () => void> = {
        ArrowUp: () => (newCursor = Math.max(0, cursor - LAYOUT.bytesPerRow)),
        ArrowDown: () =>
          (newCursor = Math.min(fileSize - 1, cursor + LAYOUT.bytesPerRow)),
        ArrowLeft: () => (newCursor = Math.max(0, cursor - 1)),
        ArrowRight: () => (newCursor = Math.min(fileSize - 1, cursor + 1)),
        Home: () =>
          (newCursor = Math.max(0, cursor - (cursor % LAYOUT.bytesPerRow))),
        End: () =>
          (newCursor = Math.min(
            fileSize - 1,
            cursor + (LAYOUT.bytesPerRow - 1 - (cursor % LAYOUT.bytesPerRow))
          )),
      };

      keyActions[key]?.();

      if (e.shiftKey) {
        const start = selection.start ?? newCursor;
        updateSelectionState({ start, end: newCursor, cursor: newCursor });
      } else {
        updateSelectionState({
          cursor: newCursor,
          start: newCursor,
          end: newCursor,
          isDragging: false,
          dragStart: null,
        });
      }
    },
    [fileSize, selection, updateSelectionState]
  );

  // ===== Cleanup =====
  useEffect(
    () => () => {
      contextMenuRef.current = null;
    },
    []
  );

  // ===== Set Selection (for external API) =====
  const setSelection = useCallback(
    (index: number, endIndex: number, isDragging = false) => {
      setSelectionStates((prev) => ({
        ...prev,
        [activeKey]: {
          ...(prev[activeKey] || {}),
          cursor: index,
          start: index,
          end: endIndex,
          isDragging,
          dragStart: null,
        },
      }));
    },
    [activeKey, setSelectionStates]
  );

  return {
    contextMenu: contextMenuRef.current,
    closeContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleCopyHex,
    handleCopyText,
    handleCopyOffset,
    handleKeyDown,
    setSelection,
  };
};
