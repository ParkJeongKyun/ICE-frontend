import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useReducer,
} from 'react';
import { isMobile } from 'react-device-detect';

// Contexts
import {
  useTab,
  useScroll,
  useSelection,
} from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useMessage } from '@/contexts/MessageContext/MessageContext';
import { useHexViewerCacheContext } from '@/contexts/HexViewerCacheContext/HexViewerCacheContext';

// Components & Styles
import {
  HexViewerContainer,
  CanvasContainer,
  CanvasArea,
  StyledCanvas,
  HeaderCanvas,
  VirtualScrollbar,
  ScrollbarThumb,
  HorizontalScrollbar,
  HorizontalScrollbarThumb,
  ContextMenu,
  ContextMenuList,
  ContextMenuItem,
} from './HexViewer.styles';

// Constants & Utils
import {
  CHUNK_REQUEST_DEBOUNCE,
  LAYOUT,
  MIN_HEX_WIDTH,
  COLOR_KEYS,
  DEFAULT_COLORS,
} from '@/constants/hexViewer';
import { getDevicePixelRatio } from '@/utils/hexViewer';

// Hooks
import { useHexViewerSelection } from './hooks/useHexViewerSelection';
import { useHexViewerRender } from './hooks/useHexViewerRender';
import { useHexViewerWorker } from './hooks/useHexViewerWorker';
import { useHexViewerXScroll } from './hooks/useHexViewerXScroll';
import { useHexViewerYScroll } from './hooks/useHexViewerYScroll';

export interface IndexInfo {
  index: number;
  offset: number;
}

export interface HexViewerRef {
  scrollToIndex: (index: number, offset: number) => void;
}

const { bytesPerRow, rowHeight } = LAYOUT;

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (
  props,
  ref
) => {
  // ==================================================================================
  // 1. Contexts & Hooks
  // ==================================================================================
  const { activeData, encoding, activeKey } = useTab();
  const { scrollPositions, setScrollPositions } = useScroll();
  const { activeSelectionState } = useSelection();
  const { fileWorker, getWorkerCache } = useWorker();
  const { showMessage } = useMessage();
  const { chunkCacheRef, requestedChunksRef, getByte, checkCacheSize } =
    useHexViewerCacheContext();

  // Derived States
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  // ==================================================================================
  // 2. Refs & Local States
  // ==================================================================================
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // DOM Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  // Logic Control Refs
  const firstRowRef = useRef(0);
  const isInitialLoadingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasValidDataRef = useRef(false);
  const tabInitialized = useRef(new Set<string>());
  const initializedTabKeyRef = useRef<string | null>(null);

  // Animation & Rendering Refs
  const rafRef = useRef<number | null>(null);
  const renderRequestRef = useRef<number | null>(null);
  const canvasSizeRef = useRef(canvasSize);
  const directRenderRef = useRef<() => void>(() => {});

  // Guard Refs (Infinite Loop Prevention)
  const isManualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef<number | null>(null);
  const lastAutoScrollCursorRef = useRef<number | null>(null);
  const prevFileMetaRef = useRef<{
    name: string;
    size: number;
    lastModified: number;
  } | null>(null);
  const prevVisibleRowsRef = useRef<number>(0);

  // Stable References for Effect Dependencies
  const fileRef = useRef(file);
  const fileWorkerRef = useRef(fileWorker);
  const colorsRef = useRef<any>(null);

  // Preview Selection (High-Performance Dragging)
  const selectionPreviewRef = useRef<
    import('@/contexts/TabDataContext/TabDataContext').SelectionState | null
  >(null);

  // Calculated Values
  const visibleRows = Math.floor(
    (canvasSize.height - LAYOUT.headerHeight) / rowHeight
  );
  const maxFirstRow = Math.max(0, rowCount - visibleRows);

  // ==================================================================================
  // 3. Helper Functions
  // ==================================================================================

  // A. React Render Trigger (Throttled)
  // Used to sync React state eventually (e.g. for loading spinners)
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const throttledRender = useCallback(() => {
    if (renderRequestRef.current === null) {
      renderRequestRef.current = requestAnimationFrame(() => {
        forceUpdate();
        renderRequestRef.current = null;
      });
    }
  }, []);

  // B. Direct Canvas Repaint (Immediate)
  // Bypasses React render cycle for high-performance updates (Scroll, Drag, Data Load)
  const handleDragRepaint = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      directRenderRef.current?.();
      rafRef.current = null;
    });
  }, []);

  // [NEW] Combined Handler for Chunk Loading
  // When data arrives, we want to paint IMMEDIATELY, then update React state later.
  const handleChunkLoaded = useCallback(() => {
    handleDragRepaint(); // 1. Paint immediately (Fixes blank screen on scroll)
    throttledRender(); // 2. Update React state (clears loading flags etc.)
  }, [handleDragRepaint, throttledRender]);

  // ==================================================================================
  // 4. Custom Hooks Initialization
  // ==================================================================================

  // Rendering
  const { directRender, renderHeader } = useHexViewerRender({
    canvasRef,
    headerCanvasRef,
    firstRowRef,
    colorsRef,
    getByte,
    canvasSizeRef,
    isInitialLoadingRef,
    hasValidDataRef,
    selectionPreviewRef,
  });

  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  // Worker Data Fetching
  const { requestChunks, initializeWorker } = useHexViewerWorker({
    chunkCacheRef,
    requestedChunksRef,
    onChunkLoaded: handleChunkLoaded, // [Updated] Use the combined handler
    isInitialLoadingRef,
    visibleRows,
    checkCacheSize,
  });

  const requestChunksRef = useRef(requestChunks);
  useEffect(() => {
    requestChunksRef.current = requestChunks;
  }, [requestChunks]);

  // Selection Handling
  const {
    contextMenu,
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
  } = useHexViewerSelection({
    firstRowRef,
    fileSize,
    rowCount,
    selectionPreviewRef,
    onPreviewChange: handleDragRepaint,
  });

  // Vertical Scroll
  const {
    shouldShowScrollbar: shouldShowYScrollbar,
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
  } = useHexViewerYScroll({
    rowCount,
    visibleRows,
    maxFirstRow,
    canvasHeight: canvasSize.height,
    requestChunks,
    firstRowRef,
  });

  // Horizontal Scroll
  const {
    shouldShowScrollbar: shouldShowXScrollbar,
    scrollbarWidth: horizontalScrollbarWidth,
    scrollbarLeft: horizontalScrollbarLeft,
    scrollbarDragging: horizontalScrollbarDragging,
    handleScrollbarMouseDown: handleHorizontalScrollbarMouseDown,
    handleScrollbarTouchStart: handleHorizontalScrollbarTouchStart,
    scrollbarDragEffect: horizontalScrollbarDragEffect,
  } = useHexViewerXScroll({ containerRef });

  // ==================================================================================
  // 5. Effects (Lifecycle & Updates)
  // ==================================================================================

  // Update Stable Refs
  useEffect(() => {
    fileRef.current = file;
  }, [file]);
  useEffect(() => {
    fileWorkerRef.current = fileWorker;
  }, [fileWorker]);
  useEffect(() => {
    isDraggingRef.current = activeSelectionState?.isDragging ?? false;
  }, [activeSelectionState?.isDragging]);

  // Theme/Colors Update
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

  // Resize Observer (with forced repaint)
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
        handleDragRepaint();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleDragRepaint]);

  useEffect(() => scrollbarDragEffect(), [scrollbarDragEffect]);
  useEffect(
    () => horizontalScrollbarDragEffect(),
    [horizontalScrollbarDragEffect]
  );

  // --- Initialization & Restore Logic ---
  useEffect(() => {
    if (!file || !activeKey || !fileWorker) return;

    const isCacheEmpty =
      !chunkCacheRef.current || chunkCacheRef.current.size === 0;

    // [Case 1] Simple Re-render (Data exists, just repaint)
    if (initializedTabKeyRef.current === activeKey && !isCacheEmpty) {
      handleDragRepaint();
      return;
    }

    initializedTabKeyRef.current = activeKey;
    const existingCache = getWorkerCache(activeKey);

    // [Case 2] Restore from Global Cache
    if (existingCache && existingCache.cache.size > 0) {
      const savedPosition = scrollPositions[activeKey] ?? 0;

      requestedChunksRef.current.clear();
      existingCache.cache.forEach((_, offset) =>
        requestedChunksRef.current.add(offset)
      );

      // Reference Swap (Fastest Restore)
      if (chunkCacheRef.current !== existingCache.cache) {
        chunkCacheRef.current = existingCache.cache;
      }

      firstRowRef.current = savedPosition;
      hasValidDataRef.current = true;
      isInitialLoadingRef.current = false;

      // Force update immediately
      handleChunkLoaded();

      if (savedPosition > 0 || visibleRows > 0) {
        requestChunks(
          savedPosition,
          fileWorker,
          file,
          fileSize,
          visibleRows + 20
        );
      }
    } else {
      // [Case 3] New Initialization
      tabInitialized.current.add(activeKey);
      isInitialLoadingRef.current = true;
      hasValidDataRef.current = false;

      chunkCacheRef.current = new Map();
      requestedChunksRef.current.clear();
      firstRowRef.current = 0;

      if (scrollPositions[activeKey] !== 0) {
        setScrollPositions((prev) => ({ ...prev, [activeKey]: 0 }));
      }

      initializeWorker(0)
        .then(() => {
          isInitialLoadingRef.current = false;
          hasValidDataRef.current = true;
          handleChunkLoaded();
        })
        .catch((error) => {
          showMessage(
            'FILE_PROCESSING_FAILED',
            `Worker Init Failed: ${error.message}`
          );
        });
    }
  }, [activeKey, file, fileWorker, activeData, handleChunkLoaded]); // Added handleChunkLoaded deps

  // Sync Header & Canvas Size
  useEffect(() => {
    canvasSizeRef.current = canvasSize;
    renderHeader();
  }, [canvasSize, renderHeader]);

  // Main Render Trigger (React State Updates)
  useEffect(() => {
    if (!isInitialLoadingRef.current && hasValidDataRef.current) {
      handleDragRepaint();
    }
  }, [
    activeSelectionState,
    encoding,
    canvasSize,
    scrollPositions,
    activeKey,
    activeData,
    handleDragRepaint,
  ]);

  // Data Fetching Logic (Guarded)
  useEffect(() => {
    if (!file || !fileWorker || isDraggingRef.current) return;

    const currentMeta = {
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    };
    const prevMeta = prevFileMetaRef.current;
    const isSameFile =
      prevMeta &&
      prevMeta.name === currentMeta.name &&
      prevMeta.size === currentMeta.size &&
      prevMeta.lastModified === currentMeta.lastModified;
    const isSameSize = Math.abs(prevVisibleRowsRef.current - visibleRows) <= 2;

    if (isSameFile && isSameSize) return;

    prevFileMetaRef.current = currentMeta;
    prevVisibleRowsRef.current = visibleRows;

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
  }, [file, visibleRows, fileSize, requestChunks, fileWorker]);

  // Context Menu
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        closeContextMenu();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu, closeContextMenu]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (renderRequestRef.current)
        cancelAnimationFrame(renderRequestRef.current);
      if (manualScrollTimeoutRef.current)
        clearTimeout(manualScrollTimeoutRef.current);
      isManualScrollRef.current = false;
    };
  }, []);

  // --- Auto-Scroll Logic ---
  const cursorIndex = activeSelectionState?.cursor ?? null;
  useEffect(() => {
    if (cursorIndex === null || isManualScrollRef.current) return;
    if (lastAutoScrollCursorRef.current === cursorIndex) return;

    const cursorRow = Math.floor(cursorIndex / bytesPerRow);
    const start = firstRowRef.current;
    const end = start + visibleRows;
    let newRow = -1;

    if (cursorRow < start) newRow = cursorRow;
    else if (cursorRow >= end)
      newRow = Math.max(0, cursorRow - visibleRows + 1);

    if (newRow !== -1) {
      firstRowRef.current = newRow;
      if (fileRef.current && fileWorkerRef.current) {
        requestChunksRef.current(
          newRow,
          fileWorkerRef.current,
          fileRef.current,
          fileSize,
          visibleRows + 20
        );
      }
      setScrollPositions((prev) => ({ ...prev, [activeKey]: newRow }));
      handleDragRepaint();
    }

    lastAutoScrollCursorRef.current = cursorIndex;
  }, [
    cursorIndex,
    activeKey,
    bytesPerRow,
    visibleRows,
    setScrollPositions,
    fileSize,
    handleDragRepaint,
  ]);

  // --- Exposed Methods ---
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, offset: number) => {
        isManualScrollRef.current = true;
        if (manualScrollTimeoutRef.current)
          clearTimeout(manualScrollTimeoutRef.current);

        const targetRow = Math.floor(index / bytesPerRow);
        firstRowRef.current = targetRow;

        if (file && fileWorker && requestChunksRef.current) {
          requestChunksRef.current(
            targetRow,
            fileWorker,
            file,
            fileSize,
            visibleRows + 20
          );
        }

        updateScrollPosition(targetRow);
        const endIndex =
          offset > 0 ? Math.min(index + offset - 1, fileSize - 1) : index;
        setSelection(index, endIndex);

        handleDragRepaint();

        manualScrollTimeoutRef.current = window.setTimeout(() => {
          isManualScrollRef.current = false;
          manualScrollTimeoutRef.current = null;
        }, 100);
      },
    }),
    [
      updateScrollPosition,
      bytesPerRow,
      fileSize,
      setSelection,
      file,
      fileWorker,
      visibleRows,
      handleDragRepaint,
    ]
  );

  return (
    <HexViewerContainer
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CanvasContainer
        ref={containerRef}
        tabIndex={0}
        onMouseDown={(e) => e.currentTarget.focus()}
      >
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
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          />
        </CanvasArea>
      </CanvasContainer>

      {shouldShowYScrollbar && (
        <VirtualScrollbar>
          <ScrollbarThumb
            ref={scrollbarRef}
            $dragging={scrollbarDragging.toString()}
            $height={scrollbarHeight}
            $translateY={scrollbarTop}
            onMouseDown={handleScrollbarMouseDown}
            onTouchStart={handleScrollbarTouchStart}
          />
        </VirtualScrollbar>
      )}

      {shouldShowXScrollbar && (
        <HorizontalScrollbar>
          <HorizontalScrollbarThumb
            $dragging={horizontalScrollbarDragging.toString()}
            $width={horizontalScrollbarWidth}
            $translateX={horizontalScrollbarLeft}
            onMouseDown={handleHorizontalScrollbarMouseDown}
            onTouchStart={handleHorizontalScrollbarTouchStart}
          />
        </HorizontalScrollbar>
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
            <ContextMenuItem onClick={handleCopyOffset}>
              Copy Offset (Hex)
            </ContextMenuItem>
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
