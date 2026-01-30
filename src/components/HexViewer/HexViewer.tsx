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
  // --- Contexts ---
  const { activeData, encoding, activeKey } = useTab();
  const { scrollPositions, setScrollPositions } = useScroll();
  const { activeSelectionState } = useSelection();
  const { fileWorker, getWorkerCache } = useWorker();
  const { showMessage } = useMessage();
  const { chunkCacheRef, requestedChunksRef, getByte, checkCacheSize } =
    useHexViewerCacheContext();

  // --- Derived State ---
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  // --- Local State ---
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // --- Refs (Mutable State) ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  // Logic Flags & Caches
  const firstRowRef = useRef(0);
  const isInitialLoadingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasValidDataRef = useRef(false);
  const tabInitialized = useRef(new Set<string>());
  const initializedTabKeyRef = useRef<string | null>(null);

  // Rendering & Animation
  const rafRef = useRef<number | null>(null);
  const renderRequestRef = useRef<number | null>(null);
  const canvasSizeRef = useRef(canvasSize);

  // Guard Refs (Prevent Infinite Loops)
  const isManualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef<number | null>(null);
  const lastAutoScrollCursorRef = useRef<number | null>(null);
  const prevFileMetaRef = useRef<{
    name: string;
    size: number;
    lastModified: number;
  } | null>(null);
  const prevVisibleRowsRef = useRef<number>(0);

  // Stable Access Refs (For Effects)
  const fileRef = useRef(file);
  const fileWorkerRef = useRef(fileWorker);

  // Colors Cache
  const colorsRef = useRef<any>(null);

  // Preview Selection (High-performance Dragging)
  const selectionPreviewRef = useRef<
    import('@/contexts/TabDataContext/TabDataContext').SelectionState | null
  >(null);

  // --- Calculated Values ---
  const visibleRows = Math.floor(
    (canvasSize.height - LAYOUT.headerHeight) / rowHeight
  );
  const maxFirstRow = Math.max(0, rowCount - visibleRows);

  // --- Helper: Throttled React Render ---
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const throttledRender = useCallback(() => {
    if (renderRequestRef.current === null) {
      renderRequestRef.current = requestAnimationFrame(() => {
        forceUpdate();
        renderRequestRef.current = null;
      });
    }
  }, []);

  // --- Helper: Immediate Direct Repaint (Bypasses React Render) ---
  const directRenderRef = useRef<() => void>(() => {});
  const handleDragRepaint = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      directRenderRef.current?.();
      rafRef.current = null;
    });
  }, []);

  // --- Custom Hooks Initialization ---

  // 1. Rendering Logic
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

  // 2. Worker / Data Fetching
  const { requestChunks, initializeWorker } = useHexViewerWorker({
    chunkCacheRef,
    requestedChunksRef,
    onChunkLoaded: throttledRender,
    isInitialLoadingRef,
    visibleRows,
    checkCacheSize,
  });

  const requestChunksRef = useRef(requestChunks);
  useEffect(() => {
    requestChunksRef.current = requestChunks;
  }, [requestChunks]);

  // 3. Selection Logic
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
    onPreviewChange: handleDragRepaint, // Pass the immediate repainter
  });

  // 4. Scrolling Logic (Y-Axis)
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

  // 5. Scrolling Logic (X-Axis)
  const {
    shouldShowScrollbar: shouldShowXScrollbar,
    scrollbarWidth: horizontalScrollbarWidth,
    scrollbarLeft: horizontalScrollbarLeft,
    scrollbarDragging: horizontalScrollbarDragging,
    handleScrollbarMouseDown: handleHorizontalScrollbarMouseDown,
    handleScrollbarTouchStart: handleHorizontalScrollbarTouchStart,
    scrollbarDragEffect: horizontalScrollbarDragEffect,
  } = useHexViewerXScroll({ containerRef });

  // --- Effects ---

  // Update stable refs
  useEffect(() => {
    fileRef.current = file;
  }, [file]);
  useEffect(() => {
    fileWorkerRef.current = fileWorker;
  }, [fileWorker]);
  useEffect(() => {
    isDraggingRef.current = activeSelectionState?.isDragging ?? false;
  }, [activeSelectionState?.isDragging]);

  // Initialize Colors (Theme support)
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

  // Resize Observer
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

  useEffect(() => scrollbarDragEffect(), [scrollbarDragEffect]);
  useEffect(
    () => horizontalScrollbarDragEffect(),
    [horizontalScrollbarDragEffect]
  );

  // --- Initialization & Restore Logic ---
  useEffect(() => {
    if (!file || !activeKey || !fileWorker) return;
    if (initializedTabKeyRef.current === activeKey) return;

    initializedTabKeyRef.current = activeKey;
    const existingCache = getWorkerCache(activeKey);

    const triggerPaint = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        directRenderRef.current?.();
        rafRef.current = null;
      });
    };

    if (existingCache) {
      const savedPosition = scrollPositions[activeKey] ?? 0;
      requestedChunksRef.current.clear();
      existingCache.cache.forEach((_, offset) =>
        requestedChunksRef.current.add(offset)
      );
      chunkCacheRef.current = existingCache.cache;
      firstRowRef.current = savedPosition;

      throttledRender();
      triggerPaint();

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
          throttledRender();
          triggerPaint();
        })
        .catch((error) => {
          showMessage(
            'FILE_PROCESSING_FAILED',
            `Worker Init Failed: ${error.message}`
          );
        });
    }
  }, [activeKey]);

  useEffect(() => {
    canvasSizeRef.current = canvasSize;
    renderHeader();
  }, [canvasSize, renderHeader]);

  // Main Render Trigger
  useEffect(() => {
    if (!isInitialLoadingRef.current && hasValidDataRef.current) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        directRenderRef.current?.();
        rafRef.current = null;
      });
    }
  }, [activeSelectionState, encoding, canvasSize, scrollPositions, activeKey]);

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

  // --- Auto-Scroll Logic (Strictly Guarded) ---
  const cursorIndex = activeSelectionState?.cursor ?? null;
  useEffect(() => {
    // 1. Skip if manual scroll in progress or no cursor
    if (cursorIndex === null || isManualScrollRef.current) return;

    // 2. Guard: Skip if cursor hasn't changed (prevents loop on context update)
    if (lastAutoScrollCursorRef.current === cursorIndex) return;

    const cursorRow = Math.floor(cursorIndex / bytesPerRow);
    const start = firstRowRef.current;
    const end = start + visibleRows;
    let newRow = -1;

    if (cursorRow < start) newRow = cursorRow;
    else if (cursorRow >= end)
      newRow = Math.max(0, cursorRow - visibleRows + 1);

    if (newRow !== -1) {
      firstRowRef.current = newRow; // Sync ref immediately

      // Use refs to request data without adding dependencies
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

      // Immediate repaint
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
  ]);

  // --- Public Methods (Ref) ---
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, offset: number) => {
        isManualScrollRef.current = true;
        if (manualScrollTimeoutRef.current)
          clearTimeout(manualScrollTimeoutRef.current);

        const targetRow = Math.floor(index / bytesPerRow);

        firstRowRef.current = targetRow;

        if (file && fileWorker) {
          requestChunks(
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
      requestChunks,
      visibleRows,
      handleDragRepaint,
    ]
  );

  // --- Render JSX ---
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
