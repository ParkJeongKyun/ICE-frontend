import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useReducer,
} from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext';
import { useWorker } from '@/contexts/WorkerContext';
import {
  HexViewerContainer,
  CanvasContainer,
  CanvasArea,
  StyledCanvas,
  HeaderCanvas,
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
  CHUNK_REQUEST_DEBOUNCE,
  LAYOUT,
  MIN_HEX_WIDTH,
  COLOR_KEYS,
  DEFAULT_COLORS,
} from '@/constants/hexViewer';
import { getDevicePixelRatio } from '@/utils/hexViewer';
import { useHexViewerCache } from './hooks/useHexViewerCache';
import { useHexViewerScroll } from './hooks/useHexViewerScroll';
import { useHexViewerSelection } from './hooks/useHexViewerSelection';
import { useHexViewerRender } from './hooks/useHexViewerRender';
import { useHexViewerWorker } from './hooks/useHexViewerWorker';
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

const { bytesPerRow, rowHeight } = LAYOUT;

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  // ===== Contexts =====
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

  // ===== Basic States =====
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);
  const selectionRange = selectionStates[activeKey] || { start: null, end: null };

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [renderCount, forceRender] = useReducer((x) => x + 1, 0);

  // ===== Refs =====
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const workerMessageHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);
  const isInitialLoadingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const selectionRangeRef = useRef(selectionRange);
  const encodingRef = useRef<EncodingType>(encoding);
  const canvasSizeRef = useRef(canvasSize);
  const hasValidDataRef = useRef(false);
  const tabInitialized = useRef(new Set<string>());
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

  // ===== Calculated Values =====
  const visibleRows = Math.floor((canvasSize.height - LAYOUT.headerHeight) / rowHeight);
  const maxFirstRow = Math.max(0, rowCount - visibleRows);
  const scrollbarHeight = Math.max(30, (visibleRows / rowCount) * canvasSize.height);
  const shouldShowScrollbar = rowCount > visibleRows && fileSize > 0;

  // ===== Custom Hooks =====
  const { chunkCacheRef, requestedChunksRef, getByte, checkCacheSize } = useHexViewerCache();
  
  const firstRowRef = useRef(0);

  const {
    isDragging,
    updateSelection,
    contextMenu,
    setContextMenu,
    closeContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
  } = useHexViewerSelection({
    activeKey,
    firstRowRef,
    fileSize,
    rowCount,
    selectionStates,
  });

  const { directRender, renderHeader } = useHexViewerRender({
    canvasRef,
    headerCanvasRef,
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

  const { requestChunks, initializeWorker } = useHexViewerWorker({
    file,
    fileWorker,
    activeKey,
    fileSize,
    rowCount,
    setWorkerCache,
    chunkCacheRef,
    requestedChunksRef,
    onChunkLoaded: forceRender,
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
    updateScrollPosition,
    scrollbarDragging,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleScrollbarMouseDown,
    handleScrollbarTouchStart,
    scrollbarDragEffect,
  } = useHexViewerScroll({
    activeKey,
    rowCount,
    visibleRows,
    maxFirstRow,
    canvasHeight: canvasSize.height,
    scrollbarHeight,
    file,
    fileSize,
    fileWorker,
    requestChunks,
    directRenderRef,
    firstRowRef,
  });


  const scrollbarTop = Math.min(
    canvasSize.height - scrollbarHeight,
    (firstRowRef.current / maxFirstRow) * (canvasSize.height - scrollbarHeight) || 0
  );

  const handleScrollPositionUpdate = useCallback(
    (position: number) => {
      updateScrollPosition(position);
      forceRender();
    },
    [updateScrollPosition]
  );

  const {
    findByOffset, findAllByHex, findAllByAsciiText, cleanup: cleanupSearch
  } = useHexViewerSearch({ file, fileSize, fileWorker, activeKey, setProcessInfo });

  // ===== Effects =====
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      colorsRef.current = {
        HEX_EVEN: style.getPropertyValue(COLOR_KEYS.HEX_EVEN).trim() || DEFAULT_COLORS.HEX_EVEN,
        HEX_ODD: style.getPropertyValue(COLOR_KEYS.HEX_ODD).trim() || DEFAULT_COLORS.HEX_ODD,
        ASCII: style.getPropertyValue(COLOR_KEYS.ASCII).trim() || DEFAULT_COLORS.ASCII,
        ASCII_DISABLED: style.getPropertyValue(COLOR_KEYS.ASCII_DISABLED).trim() || DEFAULT_COLORS.ASCII_DISABLED,
        SELECTED_BG: style.getPropertyValue(COLOR_KEYS.SELECTED_BG).trim() || DEFAULT_COLORS.SELECTED_BG,
        SELECTED_TEXT: style.getPropertyValue(COLOR_KEYS.SELECTED_TEXT).trim() || DEFAULT_COLORS.SELECTED_TEXT,
        OFFSET: style.getPropertyValue(COLOR_KEYS.OFFSET).trim() || DEFAULT_COLORS.OFFSET,
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

  useEffect(() => {
    return scrollbarDragEffect();
  }, [scrollbarDragEffect]);

  useEffect(() => {
    if (!containerRef.current) return;
    const dpr = getDevicePixelRatio();
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = isMobile ? MIN_HEX_WIDTH * dpr : Math.max(entry.contentRect.width, MIN_HEX_WIDTH) * dpr;
        const height = Math.floor(entry.contentRect.height);
        setCanvasSize((prev) => (prev.width !== width || prev.height !== height ? { width, height } : prev));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!file || !activeKey || !fileWorker) return;

    if (tabInitialized.current.has(activeKey)) {
      const existingCache = getWorkerCache(activeKey);
      if (existingCache) {
        const savedPosition = scrollPositions[activeKey] ?? 0;
        requestedChunksRef.current.clear();
        existingCache.cache.forEach((_, offset) => requestedChunksRef.current.add(offset));
        chunkCacheRef.current = existingCache.cache;
        firstRowRef.current = savedPosition;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        forceRender();
        if (savedPosition > 0 || visibleRows > 0) {
          requestChunks(savedPosition, fileWorker, file, fileSize, visibleRows + 20);
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
      setScrollPositions((prev) => (prev[activeKey] === 0 ? prev : { ...prev, [activeKey]: 0 }));

      (async () => {
        try {
          await initializeWorker(0);
          forceRender();
        } catch (error) {
          console.error('[HexViewer] initializeWorker 실패:', error);
        }
      })();
    }
  }, [file, activeKey, getWorkerCache, scrollPositions, requestChunks, visibleRows, fileSize, fileWorker, setScrollPositions, initializeWorker]);

  useEffect(() => {
    renderHeader();
  }, [renderHeader, canvasSize]);

  useEffect(() => {
    selectionRangeRef.current = selectionRange;
    encodingRef.current = encoding;
    canvasSizeRef.current = canvasSize;
  }, [selectionRange, encoding, canvasSize]);

  useEffect(() => {
    if (!isInitialLoadingRef.current) forceRender();
  }, [encoding, canvasSize]);

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
  }, [selectionRange, encoding, canvasSize, renderCount]);

  useEffect(() => {
    if (!file || !fileWorker || isDraggingRef.current) return;
    const timer = setTimeout(() => {
      requestChunks(firstRowRef.current, fileWorker, file, fileSize, visibleRows + 30);
    }, CHUNK_REQUEST_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [renderCount, file, visibleRows, fileSize, requestChunks, fileWorker]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu, closeContextMenu]);

  useEffect(() => {
    return () => {
      cleanupSearch();
      if (workerMessageHandlerRef.current && fileWorker) {
        fileWorker.removeEventListener('message', workerMessageHandlerRef.current);
        workerMessageHandlerRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [fileWorker, cleanupSearch]);

  // ===== Callbacks =====
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
    [selectionStates, activeKey, file, setContextMenu]
  );

  const handleCopyHex = useCallback(() => handleCopy('hex'), [handleCopy]);
  const handleCopyText = useCallback(() => handleCopy('text'), [handleCopy]);

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
    [findByOffset, findAllByHex, findAllByAsciiText, handleScrollPositionUpdate, updateSelection]
  );

  // ===== Render =====
  return (
    <HexViewerContainer onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <CanvasContainer ref={containerRef} tabIndex={0}>
        <CanvasArea style={{ minWidth: `${MIN_HEX_WIDTH}px` }}>
          <HeaderCanvas
            ref={headerCanvasRef}
            width={canvasSize.width}
            height={LAYOUT.headerHeight}
            style={{
              width: `${canvasSize.width / getDevicePixelRatio()}px`,
              height: `${LAYOUT.headerHeight}px`,
            }}
          />
          <StyledCanvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height - LAYOUT.headerHeight}
            style={{
              width: `${canvasSize.width / getDevicePixelRatio()}px`,
              height: `${canvasSize.height - LAYOUT.headerHeight}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
          />
        </CanvasArea>
      </CanvasContainer>
      {shouldShowScrollbar && (
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
            top: contextMenu.y - (containerRef.current?.getBoundingClientRect().top || 0),
            left: contextMenu.x - (containerRef.current?.getBoundingClientRect().left || 0),
          }}
          onClick={closeContextMenu}
          onBlur={closeContextMenu}
        >
          <ContextMenuList>
            <ContextMenuItem onClick={handleCopyHex}>Copy (Hex String)</ContextMenuItem>
            <ContextMenuItem onClick={handleCopyText}>Copy (ASCII Text)</ContextMenuItem>
          </ContextMenuList>
        </ContextMenu>
      )}
    </HexViewerContainer>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
