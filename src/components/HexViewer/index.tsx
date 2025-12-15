import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext';
import { useWorker } from '@/contexts/WorkerContext';
import {
  HexViewerContainer,
  CanvasContainer,
  CanvasArea,
  StyledCanvas,
  VirtualScrollbar,
  ScrollbarThumb,
  ContextMenu,
  ContextMenuList,
  ContextMenuItem,
} from './index.styles';
import { isMobile } from 'react-device-detect';
import {
  MAX_COPY_SIZE,
  COPY_CHUNK_SIZE,
  RENDER_INTERVAL,
  UPDATE_INTERVAL,
  CHUNK_REQUEST_DEBOUNCE,
  LAYOUT,
  HEX_START_X,
  ASCII_START_X,
  MIN_HEX_WIDTH,
  COLOR_KEYS,
  DEFAULT_COLORS,
} from '@/constants/hexViewer';
import { getDevicePixelRatio } from '@/utils/hexViewer';
import { asciiToBytes } from '@/utils/byteSearch';
import { useHexViewerCache } from './hooks/useHexViewerCache';
import { useHexViewerScroll } from './hooks/useHexViewerScroll';
import { useHexViewerSelection } from './hooks/useHexViewerSelection';
import { useHexViewerRender } from './hooks/useHexViewerRender';
import { useHexViewerWorker } from './hooks/useHexViewerWorker';
import { useHexViewerEvents } from './hooks/useHexViewerEvents';
import { useHexViewerSearch } from './hooks/useHexViewerSearch';
import { EncodingType } from '@/contexts/TabDataContext';

export interface IndexInfo {
  index: number;
  offset: number;
}

export interface HexViewerRef {
  findByOffset: (offset: string) => Promise<IndexInfo | null>;
  findAllByHex: (hex: string) => Promise<IndexInfo[] | null>;
  findAllByAsciiText: (
    text: string,
    ignoreCase: boolean
  ) => Promise<IndexInfo[] | null>;
  scrollToIndex: (rowIndex: number, offset: number) => void;
}

const {
  bytesPerRow,
  rowHeight,
  hexByteWidth,
  asciiCharWidth,
} = LAYOUT;

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  const {
    activeData,
    encoding,
    activeKey,
    scrollPositions,
    selectionStates,
    setScrollPositions,
  } = useTabData();
  const { setProcessInfo, fileWorker } = useProcess();
  const { getWorkerCache, setWorkerCache } = useWorker();

  const { chunkCacheRef, requestedChunksRef, getByte, checkCacheSize } =
    useHexViewerCache();
  const { firstRowRef, updateScrollPosition } = useHexViewerScroll(activeKey);

  const selectionRange = selectionStates[activeKey] || {
    start: null,
    end: null,
  };
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const { updateSelection } = useHexViewerSelection({
    activeKey,
    setRenderTrigger,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const workerMessageHandlerRef = useRef<((e: MessageEvent) => void) | null>(
    null
  );
  const isInitialLoadingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const selectionRangeRef = useRef(selectionRange);
  const encodingRef = useRef<EncodingType>(encoding);
  const canvasSizeRef = useRef(canvasSize);
  const hasValidDataRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  const visibleRows = Math.floor(canvasSize.height / rowHeight);
  const maxFirstRow = Math.max(0, rowCount - visibleRows);
  const scrollbarAreaHeight = canvasSize.height;
  const scrollbarHeight = Math.max(
    30,
    (visibleRows / rowCount) * scrollbarAreaHeight
  );
  const maxScrollbarTop = scrollbarAreaHeight - scrollbarHeight;
  const scrollbarTop = Math.min(
    maxScrollbarTop,
    (firstRowRef.current / maxFirstRow) * maxScrollbarTop || 0
  );

  const colorsRef = useRef<{
    HEX_EVEN: string;
    HEX_ODD: string;
    ASCII: string;
    ASCII_DISABLED: string;
    SELECTED_BG: string;
    SELECTED_TEXT: string;
    OFFSET: string;
    BG: string;
  } | null>(null);

  const getByteIndexFromMouse = useCallback(
    (x: number, y: number): number | null => {
      const row = firstRowRef.current + Math.floor(y / rowHeight);
      if (row < 0 || row >= rowCount) return null;

      if (x >= HEX_START_X && x < HEX_START_X + bytesPerRow * hexByteWidth) {
        const col = Math.floor((x - HEX_START_X) / hexByteWidth);
        if (col < 0 || col >= bytesPerRow) return null;
        const idx = row * bytesPerRow + col;
        return idx >= fileSize ? null : idx;
      }

      if (
        x >= ASCII_START_X &&
        x < ASCII_START_X + bytesPerRow * asciiCharWidth
      ) {
        const col = Math.floor((x - ASCII_START_X) / asciiCharWidth);
        if (col < 0 || col >= bytesPerRow) return null;
        const idx = row * bytesPerRow + col;
        return idx >= fileSize ? null : idx;
      }

      return null;
    },
    [
      firstRowRef,
      rowCount,
      fileSize,
      rowHeight,
      bytesPerRow,
      hexByteWidth,
      asciiCharWidth,
    ]
  );

  const handleScrollPositionUpdate = useCallback(
    (position: number) => {
      updateScrollPosition(position);
      setRenderTrigger((prev) => prev + 1);
    },
    [updateScrollPosition]
  );

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      colorsRef.current = {
        HEX_EVEN:
          style.getPropertyValue(COLOR_KEYS.HEX_EVEN).trim() ||
          DEFAULT_COLORS.HEX_EVEN,
        HEX_ODD:
          style.getPropertyValue(COLOR_KEYS.HEX_ODD).trim() ||
          DEFAULT_COLORS.HEX_ODD,
        ASCII:
          style.getPropertyValue(COLOR_KEYS.ASCII).trim() ||
          DEFAULT_COLORS.ASCII,
        ASCII_DISABLED:
          style.getPropertyValue(COLOR_KEYS.ASCII_DISABLED).trim() ||
          DEFAULT_COLORS.ASCII_DISABLED,
        SELECTED_BG:
          style.getPropertyValue(COLOR_KEYS.SELECTED_BG).trim() ||
          DEFAULT_COLORS.SELECTED_BG,
        SELECTED_TEXT:
          style.getPropertyValue(COLOR_KEYS.SELECTED_TEXT).trim() ||
          DEFAULT_COLORS.SELECTED_TEXT,
        OFFSET:
          style.getPropertyValue(COLOR_KEYS.OFFSET).trim() ||
          DEFAULT_COLORS.OFFSET,
        BG: style.getPropertyValue(COLOR_KEYS.BG).trim() || DEFAULT_COLORS.BG,
      };
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const { requestChunks, initializeWorker } = useHexViewerWorker({
    file,
    fileWorker,
    activeKey,
    fileSize,
    rowCount,
    setWorkerCache,
    chunkCacheRef,
    requestedChunksRef,
    setRenderTrigger,
    canvasRef,
    colorsRef,
    isDraggingRef,
    workerMessageHandlerRef,
    isInitialLoadingRef,
    canvasSizeRef,
    visibleRows,
    checkCacheSize,
  });

  const {
    isDragging,
    contextMenu,
    setContextMenu,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    closeContextMenu,
  } = useHexViewerEvents({
    firstRowRef,
    rowCount,
    fileSize,
    maxFirstRow,
    handleScrollPositionUpdate,
    updateSelection,
    getByteIndexFromMouse,
    selectionStates,
    activeKey,
  });

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

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
            const chunk = selected.slice(
              i,
              Math.min(i + COPY_CHUNK_SIZE, selected.length)
            );
            if (format === 'hex') {
              result +=
                Array.from(chunk)
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join(' ') + ' ';
            } else {
              result += Array.from(chunk)
                .map((b) =>
                  b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'
                )
                .join('');
            }
          }

          await navigator.clipboard.writeText(
            format === 'hex' ? result.trim() : result
          );
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

  const { findByOffset, findAllByHex, findAllByAsciiText, cleanup: cleanupSearch } =
    useHexViewerSearch({
      file,
      fileSize,
      fileWorker,
      activeKey,
      setProcessInfo,
    });

  useImperativeHandle(
    ref,
    () => ({
      findByOffset,
      findAllByHex,
      findAllByAsciiText,
      scrollToIndex: (index: number, offset: number) => {
        const targetRow = Math.floor(index / bytesPerRow);
        handleScrollPositionUpdate(targetRow);
        updateSelection(index, index + offset - 1);
      },
    }),
    [
      findByOffset,
      findAllByHex,
      findAllByAsciiText,
      handleScrollPositionUpdate,
      updateSelection,
    ]
  );

  useEffect(() => {
    return () => {
      cleanupSearch();

      if (workerMessageHandlerRef.current && fileWorker) {
        fileWorker.removeEventListener(
          'message',
          workerMessageHandlerRef.current
        );
        workerMessageHandlerRef.current = null;
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [fileWorker, cleanupSearch]);

  useEffect(() => {
    if (!containerRef.current) return;
    const dpr = getDevicePixelRatio();
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = isMobile
          ? MIN_HEX_WIDTH * dpr
          : Math.max(entry.contentRect.width, MIN_HEX_WIDTH) * dpr;
        const height = Math.floor(entry.contentRect.height);
        setCanvasSize((prev) =>
          prev.width !== width || prev.height !== height
            ? { width, height }
            : prev
        );
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const tabInitialized = useRef(new Set<string>());

  useEffect(() => {
    if (!file || !activeKey || !fileWorker) return;

    if (tabInitialized.current.has(activeKey)) {
      const existingCache = getWorkerCache(activeKey);
      if (existingCache) {
        const savedPosition = scrollPositions[activeKey] ?? 0;

        requestedChunksRef.current.clear();
        existingCache.cache.forEach((_, offset) => {
          requestedChunksRef.current.add(offset);
        });

        chunkCacheRef.current = existingCache.cache;
        firstRowRef.current = savedPosition;

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        setRenderTrigger((prev) => prev + 1);

        if (savedPosition > 0 || visibleRows > 0) {
          requestChunks(
            savedPosition,
            fileWorker,
            file,
            fileSize,
            visibleRows + 20
          );
        }
      }
      return;
    }

    const existingCache = getWorkerCache(activeKey);

    if (!existingCache) {
      tabInitialized.current.add(activeKey);
      isInitialLoadingRef.current = true;
      hasValidDataRef.current = false;

      chunkCacheRef.current = new Map();
      requestedChunksRef.current.clear();
      firstRowRef.current = 0;

      setScrollPositions((prev) =>
        prev[activeKey] === 0 ? prev : { ...prev, [activeKey]: 0 }
      );

      // ✅ async/await로 명시적 대기
      (async () => {
        try {
          await initializeWorker(0);
          // ✅ 한 번 더 렌더링 트리거 (보험)
          setRenderTrigger((prev) => prev + 1);
        } catch (error) {
          console.error('[HexViewer] initializeWorker 실패:', error);
        }
      })();
    }
  }, [
    file,
    activeKey,
    getWorkerCache,
    scrollPositions,
    requestChunks,
    visibleRows,
    fileSize,
    fileWorker,
    setScrollPositions,
    initializeWorker,
  ]);

  const { directRender } = useHexViewerRender({
    canvasRef,
    firstRowRef,
    colorsRef,
    getByte,
    fileSize,
    rowCount,
    selectionRangeRef,
    encodingRef,
    canvasSizeRef,
    isInitialLoadingRef,
    hasValidDataRef,
  });

  const directRenderRef = useRef(directRender);
  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  useEffect(() => {
    selectionRangeRef.current = selectionRange;
    encodingRef.current = encoding;
    canvasSizeRef.current = canvasSize;
  }, [selectionRange, encoding, canvasSize]);

  useEffect(() => {
    if (!isInitialLoadingRef.current) {
      setRenderTrigger((prev) => prev + 1);
    }
  }, [encoding]);

  useEffect(() => {
    if (!isInitialLoadingRef.current) {
      setRenderTrigger((prev) => prev + 1);
    }
  }, [canvasSize]);

  useEffect(() => {
    if (!isInitialLoadingRef.current) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      if (!isDraggingRef.current) {
        directRenderRef.current();
      } else {
        rafRef.current = requestAnimationFrame(() => {
          directRenderRef.current();
          rafRef.current = null;
        });
      }
    }
  }, [renderTrigger]);

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

  const handleScrollbarEnd = useCallback(() => {
    setScrollbarDragging(false);
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    setRenderTrigger((prev) => prev + 1);
  }, []);

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
        const rowDelta = -Math.round(deltaY / rowHeight);
        const nextRow = Math.max(
          0,
          Math.min(touchStartRowRef.current + rowDelta, maxFirstRow)
        );
        if (nextRow !== firstRowRef.current)
          handleScrollPositionUpdate(nextRow);
      }
    },
    [scrollbarDragging, maxFirstRow, handleScrollPositionUpdate, firstRowRef]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  }, []);

  useEffect(() => {
    if (!scrollbarDragging || !fileWorker) return;

    isDraggingRef.current = true;

    if (file) {
      requestChunks(
        firstRowRef.current,
        fileWorker,
        file,
        fileSize,
        visibleRows + 100
      );
    }

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
        const totalScrollable = canvasSize.height - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round(
          (deltaY / totalScrollable) * (rowCount - visibleRows)
        );
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));

        if (nextRow !== firstRowRef.current) {
          updateScrollPosition(nextRow);
        }
        lastUpdateTime = currentTime;

        if (file) {
          requestChunks(nextRow, fileWorker, file, fileSize, visibleRows + 50);
        }
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
        const totalScrollable = canvasSize.height - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round(
          (deltaY / totalScrollable) * (rowCount - visibleRows)
        );
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));

        if (nextRow !== firstRowRef.current) {
          updateScrollPosition(nextRow);
        }
        lastUpdateTime = currentTime;

        if (file) {
          requestChunks(nextRow, fileWorker, file, fileSize, visibleRows + 50);
        }
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
    canvasSize.height,
    scrollbarHeight,
    file,
    fileSize,
    requestChunks,
    updateScrollPosition,
    fileWorker,
    handleScrollbarEnd,
  ]);

  useEffect(() => {
    if (!file || !fileWorker || isDraggingRef.current) return;

    const timer = setTimeout(() => {
      requestChunks(
        firstRowRef.current,
        fileWorker,
        file,
        fileSize,
        visibleRows + 30
      );
    }, CHUNK_REQUEST_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [renderTrigger, file, visibleRows, fileSize, requestChunks, fileWorker]);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  return (
    <HexViewerContainer
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CanvasContainer ref={containerRef} tabIndex={0}>
        <CanvasArea style={{ minWidth: `${MIN_HEX_WIDTH}px` }}>
          <StyledCanvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              width: `${canvasSize.width / getDevicePixelRatio()}px`,
              height: `${canvasSize.height}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
          />
        </CanvasArea>
      </CanvasContainer>
      {rowCount > visibleRows && (
        <VirtualScrollbar>
          <ScrollbarThumb
            ref={scrollbarRef}
            $dragging={scrollbarDragging.toString()}
            $height={scrollbarHeight}
            $top={scrollbarTop}
            onMouseDown={handleScrollbarMouseDown}
            onTouchStart={handleScrollbarTouchStart}
          />
        </VirtualScrollbar>
      )}
      {contextMenu && (
        <ContextMenu
          ref={contextMenuRef}
          style={{
            top:
              contextMenu.y -
              (containerRef.current?.getBoundingClientRect().top || 0),
            left:
              contextMenu.x -
              (containerRef.current?.getBoundingClientRect().left || 0),
          }}
          onClick={closeContextMenu}
          onBlur={closeContextMenu}
        >
          <ContextMenuList>
            <ContextMenuItem onClick={handleCopyHex}>
              Copy (Hex String)
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyText}>
              Copy (ASCII Text)
            </ContextMenuItem>
          </ContextMenuList>
        </ContextMenu>
      )}
    </HexViewerContainer>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
