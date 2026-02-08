import { RefObject, useCallback, useEffect, useState } from 'react';
import {
  useTab,
  useSelection,
  SelectionState,
} from '@/contexts/TabDataContext/TabDataContext';
import eventBus from '@/types/eventBus';
import {
  LAYOUT,
  HEX_START_X,
  ASCII_START_X,
  MAX_COPY_SIZE,
  COPY_CHUNK_SIZE,
} from '@/constants/hexViewer';

interface ContextMenuState {
  x: number;
  y: number;
}

interface UseHexViewerSelectionProps {
  firstRowRef: RefObject<number>;
  fileSize: number;
  rowCount: number;
  selectionPreviewRef?: RefObject<SelectionState | null>;
  onPreviewChange?: () => void;
}

export const useHexViewerSelection = ({
  firstRowRef,
  fileSize,
  rowCount,
  selectionPreviewRef,
  onPreviewChange,
}: UseHexViewerSelectionProps) => {
  const { activeKey, activeData } = useTab();
  const { selectionStates, setSelectionStates } = useSelection();
  const file = activeData?.file;

  // [Fix] useRef 대신 useState 사용 (UI 렌더링 트리거)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Get current state from context
  const selection = selectionStates[activeKey] || {
    cursor: null,
    start: null,
    end: null,
    isDragging: false,
    dragStart: null,
    selectedBytes: undefined,
  };

  // --- State Updater (Optimized) ---
  const updateSelectionState = useCallback(
    (updates: Partial<SelectionState>) => {
      setSelectionStates((prev) => {
        const defaultState: SelectionState = {
          cursor: null,
          start: null,
          end: null,
          isDragging: false,
          dragStart: null,
        };
        const current = prev[activeKey] ?? defaultState;

        const hasChanged = Object.entries(updates).some(([key, value]) => {
          return current[key as keyof SelectionState] !== value;
        });

        if (!hasChanged) return prev;

        return {
          ...prev,
          [activeKey]: { ...current, ...updates },
        };
      });
    },
    [activeKey, setSelectionStates]
  );

  // --- Helper: Mouse to Index ---
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
        return idx < fileSize ? idx : null;
      }

      if (
        x >= ASCII_START_X &&
        x < ASCII_START_X + LAYOUT.bytesPerRow * LAYOUT.asciiCharWidth
      ) {
        const col = Math.floor((x - ASCII_START_X) / LAYOUT.asciiCharWidth);
        if (col < 0 || col >= LAYOUT.bytesPerRow) return null;
        const idx = row * LAYOUT.bytesPerRow + col;
        return idx < fileSize ? idx : null;
      }

      return null;
    },
    [fileSize, rowCount, firstRowRef]
  );

  // --- Effect: Read Selected Bytes ---
  useEffect(() => {
    const readBytes = async () => {
      if (selection.start === null || selection.end === null || !file) return;
      try {
        const s = Math.max(0, Math.min(selection.start, selection.end));
        const length = Math.min(16, fileSize - s);
        if (length > 0) {
          const buf = await file.slice(s, s + length).arrayBuffer();
          updateSelectionState({ selectedBytes: new Uint8Array(buf) });
        }
      } catch (error) {
        console.error('Failed to read bytes:', error);
      }
    };
    readBytes();
  }, [selection.start, selection.end, file, fileSize, updateSelectionState]);

  // --- Event Handlers ---

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // 우클릭 시 컨텍스트 메뉴가 열려있으면 닫기
      if (contextMenu) setContextMenu(null);

      if (e.button !== 0) return; // 좌클릭만 처리

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
        if (selectionPreviewRef) selectionPreviewRef.current = null;
      } else {
        updateSelectionState({
          cursor: idx,
          start: idx,
          end: idx,
          isDragging: true,
          dragStart: idx,
        });

        if (selectionPreviewRef) {
          selectionPreviewRef.current = {
            cursor: idx,
            start: idx,
            end: idx,
            isDragging: true,
            dragStart: idx,
            selectedBytes: undefined,
          };
        }
        onPreviewChange?.();
      }
    },
    [
      contextMenu, // 의존성 추가
      getByteIndexFromMouse,
      selection.start,
      updateSelectionState,
      selectionPreviewRef,
      onPreviewChange,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const idx = getByteIndexFromMouse(
        e.clientX - rect.left,
        e.clientY - rect.top
      );

      if (idx === null) return;

      if (selectionPreviewRef && selectionPreviewRef.current?.isDragging) {
        selectionPreviewRef.current.cursor = idx;
        selectionPreviewRef.current.end = idx;
        onPreviewChange?.();
      } else if (selection.isDragging) {
        updateSelectionState({ cursor: idx, end: idx });
      }
    },
    [
      getByteIndexFromMouse,
      selection.isDragging,
      updateSelectionState,
      selectionPreviewRef,
      onPreviewChange,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (selectionPreviewRef && selectionPreviewRef.current?.isDragging) {
      const { start, end } = selectionPreviewRef.current;
      if (start !== null && end !== null) {
        updateSelectionState({
          start,
          end,
          cursor: end,
          isDragging: false,
          dragStart: null,
        });
      } else {
        updateSelectionState({ isDragging: false, dragStart: null });
      }
      selectionPreviewRef.current = null;
      onPreviewChange?.();
      return;
    }

    if (selection.isDragging) {
      updateSelectionState({ isDragging: false, dragStart: null });
    }
  }, [
    selection.isDragging,
    updateSelectionState,
    selectionPreviewRef,
    onPreviewChange,
  ]);

  // --- Context Menu (Fixed) ---
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    let y = e.clientY;
    // 화면 아래쪽 잘림 방지
    if (y + 100 > window.innerHeight) y = window.innerHeight - 100;

    // [Fix] State 업데이트로 리렌더링 유발
    setContextMenu({ x: e.clientX, y });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // --- Copy Logic ---
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
        console.error('Copy failed:', error);
        eventBus.emit('toast', { code: 'COPY_FAILED' });
      }
      setContextMenu(null); // 메뉴 닫기
    },
    [selection.start, selection.end, file]
  );

  const handleCopyHex = useCallback(() => handleCopy('hex'), [handleCopy]);
  const handleCopyText = useCallback(() => handleCopy('text'), [handleCopy]);
  const handleCopyOffset = useCallback(async () => {
    if (selection.start === null) return;
    try {
      await navigator.clipboard.writeText(
        Math.min(selection.start, selection.end ?? selection.start)
          .toString(16)
          .toUpperCase()
      );
      eventBus.emit('toast', { code: 'COPY_SUCCESS' });
    } catch {
      eventBus.emit('toast', { code: 'COPY_FAILED' });
    }
    setContextMenu(null); // 메뉴 닫기
  }, [selection.start, selection.end]);

  // --- Keyboard ---
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

  // API Wrapper
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
    contextMenu, // State 값을 반환
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
