import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useReducer,
} from 'react';

// Contexts
import {
  useTab,
  useScroll,
  useSelection,
} from '@/contexts/TabDataContext/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import eventBus from '@/types/eventBus';
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
  COLOR_KEYS,
  getLayoutConfig,
  DEFAULT_LAYOUT,
} from '@/components/HexViewer/hexViewerConstants';
import { getDevicePixelRatio } from '@/utils/hexViewer';

// Hooks
import { useHexViewerSelection } from './hooks/useHexViewerSelection';
import { useHexViewerRender } from './hooks/useHexViewerRender';
import { useHexViewerWorker } from './hooks/useHexViewerWorker';
import { useHexViewerXScroll } from './hooks/useHexViewerXScroll';
import { useHexViewerYScroll } from './hooks/useHexViewerYScroll';
import { useTranslations } from 'next-intl';

export interface IndexInfo {
  index: number;
  offset: number;
}

export interface HexViewerRef {
  scrollToIndex: (index: number, offset: number) => void;
}

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (
  props,
  ref
) => {
  const t = useTranslations();
  // ==================================================================================
  // 1. Contexts & Hooks
  // ==================================================================================
  const { activeData, activeKey } = useTab();
  const { config } = useConfig();
  const { scrollPositions, setScrollPositions } = useScroll();
  const { activeSelectionState } = useSelection();
  const { chunkWorker } = useWorker();
  const { chunkCacheRef, requestedChunksRef, getByte, checkCacheSize } =
    useHexViewerCacheContext();

  const encoding = config.ui.encoding;

  // ==================================================================================
  // 2. Layout Config (Dynamic based on viewport width and user config)
  // ==================================================================================
  const [isMeasured, setIsMeasured] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 }); // logical CSS pixels
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const layoutConfig = useMemo(
    () =>
      windowWidth > 0
        ? getLayoutConfig(
            windowWidth,
            config.ui.bytesPerLine,
            config.ui.numberBase,
            activeData?.file?.size || 0
          )
        : DEFAULT_LAYOUT,
    [
      windowWidth,
      config.ui.bytesPerLine,
      config.ui.numberBase,
      activeData?.file?.size,
    ]
  );
  const { bytesPerRow, rowHeight, headerHeight, rowCount, MIN_HEX_WIDTH } =
    layoutConfig;

  // Derived States
  const file = activeData?.file;
  const fileSize = file?.size || 0;

  // ==================================================================================
  // 3. Refs & Local States
  // ==================================================================================

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
  const prevBytesPerRowRef = useRef<number>(bytesPerRow);

  // Stable References for Effect Dependencies
  const fileRef = useRef(file);
  const chunkWorkerRef = useRef(chunkWorker);
  const colorsRef = useRef<any>(null);

  // Preview Selection (High-Performance Dragging)
  const selectionPreviewRef = useRef<
    import('@/contexts/TabDataContext/TabDataContext').SelectionState | null
  >(null);

  // Calculated Values
  const visibleRows = Math.max(
    0,
    Math.floor((canvasSize.height - headerHeight) / rowHeight)
  );
  const maxFirstRow = Math.max(0, rowCount - visibleRows);

  // ==================================================================================
  // 4. Helper Functions (Defined early for use in effects/hooks)
  // ==================================================================================

  // A. React Render Trigger (Throttled)
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
  const handleDragRepaint = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      directRenderRef.current?.();
      rafRef.current = null;
    });
  }, []);

  // C. Combined Handler for Chunk Loading
  const handleChunkLoaded = useCallback(() => {
    handleDragRepaint();
    throttledRender();
  }, [handleDragRepaint, throttledRender]);

  // ==================================================================================
  // 5. Custom Hooks & Logic Initialization
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
    layoutConfig,
  });

  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  // 설정 변경(layoutConfig 변경) 시 즉시 다시 렌더링
  useEffect(() => {
    if (isMeasured) {
      renderHeader();
      directRender();
    }
  }, [layoutConfig, isMeasured, renderHeader, directRender]);

  // Worker Data Fetching
  const { requestChunks, cancelAllRequests, initializeWorker } =
    useHexViewerWorker({
      chunkCacheRef,
      requestedChunksRef,
      onChunkLoaded: handleChunkLoaded,
      isInitialLoadingRef,
      visibleRows,
      checkCacheSize,
      bytesPerRow,
    });

  const requestChunksRef = useRef(requestChunks);
  useEffect(() => {
    requestChunksRef.current = requestChunks;
  }, [requestChunks]);

  // ✅ bytesPerRow 변경 시 스크롤 위치 보정 (동일한 바이트 오프셋 유지)
  useEffect(() => {
    if (prevBytesPerRowRef.current !== bytesPerRow) {
      const oldFirstRow = firstRowRef.current;
      const oldBytesPerRow = prevBytesPerRowRef.current;
      const byteOffset = oldFirstRow * oldBytesPerRow;
      const newFirstRow = Math.floor(byteOffset / bytesPerRow);

      const clampedRow = Math.max(0, Math.min(newFirstRow, maxFirstRow));
      firstRowRef.current = clampedRow;
      setScrollPositions((prev) => ({ ...prev, [activeKey]: clampedRow }));

      prevBytesPerRowRef.current = bytesPerRow;
      handleDragRepaint();

      if (file && chunkWorker) {
        requestChunks(clampedRow, file, fileSize, visibleRows + 20);
      }
    }
  }, [
    bytesPerRow,
    activeKey,
    maxFirstRow,
    setScrollPositions,
    file,
    fileSize,
    visibleRows,
    chunkWorker,
    handleDragRepaint,
    requestChunks,
  ]);

  // Selection Handling
  const {
    contextMenu,
    closeContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseMoveAt,
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
    layoutConfig,
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
    cancelAllRequests,
    firstRowRef,
    rowHeight,
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
  } = useHexViewerXScroll({ containerRef, minHexWidth: MIN_HEX_WIDTH });

  // ==================================================================================
  // 6. Effects (Lifecycle & Updates)
  // ==================================================================================

  // Update Stable Refs
  useEffect(() => {
    fileRef.current = file;

    // 파일 변경시 캐시 초기화 (탭 전환으로 인한 데이터 혼용 방지)
    if (file) {
      chunkCacheRef.current.clear();
      requestedChunksRef.current.clear();
    }
  }, [file, chunkCacheRef, requestedChunksRef]);
  useEffect(() => {
    chunkWorkerRef.current = chunkWorker;
  }, [chunkWorker]);
  useEffect(() => {
    isDraggingRef.current = activeSelectionState?.isDragging ?? false;
  }, [activeSelectionState?.isDragging]);

  useEffect(() => {
    if (!activeSelectionState?.isDragging) return;
    const onGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      handleMouseMoveAt(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [activeSelectionState?.isDragging, handleMouseMoveAt, handleMouseUp]);

  // Theme/Colors Update
  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      colorsRef.current = {
        HEX_EVEN: style.getPropertyValue(COLOR_KEYS.HEX_EVEN).trim(),
        HEX_ODD: style.getPropertyValue(COLOR_KEYS.HEX_ODD).trim(),
        ASCII: style.getPropertyValue(COLOR_KEYS.ASCII).trim(),
        ASCII_DISABLED: style
          .getPropertyValue(COLOR_KEYS.ASCII_DISABLED)
          .trim(),
        SELECTED_BG: style.getPropertyValue(COLOR_KEYS.SELECTED_BG).trim(),
        SELECTED_TEXT: style.getPropertyValue(COLOR_KEYS.SELECTED_TEXT).trim(),
        OFFSET: style.getPropertyValue(COLOR_KEYS.OFFSET).trim(),
        BG: style.getPropertyValue(COLOR_KEYS.BG).trim(),
      };
      handleDragRepaint();
      renderHeader();
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, [handleDragRepaint, renderHeader]);

  // Resize Observer (with forced repaint)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        setCanvasSize((prev) =>
          prev.width !== width || prev.height !== height
            ? { width, height }
            : prev
        );
        if (!isMeasured) setIsMeasured(true);
        handleDragRepaint();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleDragRepaint, isMeasured]);

  useEffect(() => scrollbarDragEffect(), [scrollbarDragEffect]);
  useEffect(
    () => horizontalScrollbarDragEffect(),
    [horizontalScrollbarDragEffect]
  );

  // --- Initialization & Restore Logic ---
  useEffect(() => {
    if (!file || !activeKey || !chunkWorker) return;

    const isCacheEmpty =
      !chunkCacheRef.current || chunkCacheRef.current.size === 0;

    // [Case 1] Simple Re-render (Data exists, just repaint)
    if (initializedTabKeyRef.current === activeKey && !isCacheEmpty) {
      handleDragRepaint();
      return;
    }

    initializedTabKeyRef.current = activeKey;

    // [Case 2] New Initialization
    tabInitialized.current.add(activeKey);
    isInitialLoadingRef.current = true;
    hasValidDataRef.current = false;

    chunkCacheRef.current = new Map();
    requestedChunksRef.current.clear();

    // 저장된 스크롤 위치 복원, 없으면 0
    const savedPosition = scrollPositions[activeKey] ?? 0;
    firstRowRef.current = savedPosition;

    initializeWorker(savedPosition)
      .then(() => {
        isInitialLoadingRef.current = false;
        hasValidDataRef.current = true;
        handleChunkLoaded();
      })
      .catch((error) => {
        eventBus.emit('toast', {
          code: 'FILE_PROCESSING_FAILED',
          message: `Worker Init Failed: ${error.message}`,
        });
      });
  }, [activeKey, file, chunkWorker, activeData, handleChunkLoaded]);

  // Sync Header & Canvas Size
  useEffect(() => {
    const dpr = getDevicePixelRatio();
    const logicalWidth = Math.max(canvasSize.width, MIN_HEX_WIDTH);
    canvasSizeRef.current = {
      width: logicalWidth * dpr,
      height: canvasSize.height * dpr,
    };
    renderHeader();
  }, [canvasSize, MIN_HEX_WIDTH, renderHeader]);

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
    if (!file || !chunkWorker || isDraggingRef.current) return;

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
      requestChunks(firstRowRef.current, file, fileSize, visibleRows + 30);
    }, CHUNK_REQUEST_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [file, visibleRows, fileSize, requestChunks, chunkWorker]);

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
      if (fileRef.current && chunkWorkerRef.current) {
        requestChunksRef.current(
          newRow,
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

        if (file && chunkWorker && requestChunksRef.current) {
          requestChunksRef.current(targetRow, file, fileSize, visibleRows + 20);
        }

        updateScrollPosition(targetRow);
        const endIndex =
          offset > 0 ? Math.min(index + offset - 1, fileSize - 1) : index;
        setSelection(index, endIndex);

        eventBus.emit('hexSelectionUpdate', {
          start: index,
          end: endIndex,
          cursor: index,
        });
        eventBus.emit('hexSelectionEnd');

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
      chunkWorker,
      visibleRows,
      handleDragRepaint,
    ]
  );

  const dpr = getDevicePixelRatio();
  const canvasLogicalWidth = Math.max(canvasSize.width, MIN_HEX_WIDTH);
  const canvasPhysicalWidth = canvasLogicalWidth * dpr;
  const canvasDataHeight = canvasSize.height - headerHeight;
  const headerPhysicalHeight = headerHeight * dpr;
  const canvasPhysicalHeight = canvasDataHeight * dpr;

  return (
    <HexViewerContainer
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        opacity: isMeasured ? 1 : 0,
        transition: 'opacity 0.15s ease-in',
      }}
    >
      <CanvasContainer
        ref={containerRef}
        tabIndex={0}
        onMouseDown={(e) => e.currentTarget.focus()}
      >
        <CanvasArea style={{ minWidth: `${MIN_HEX_WIDTH}px` }}>
          <HeaderCanvas
            ref={headerCanvasRef}
            width={canvasPhysicalWidth}
            height={headerPhysicalHeight}
            style={{
              width: `${canvasLogicalWidth}px`,
              height: `${headerHeight}px`,
            }}
          />
          <StyledCanvas
            ref={canvasRef}
            width={canvasPhysicalWidth}
            height={canvasPhysicalHeight}
            style={{
              width: `${canvasLogicalWidth}px`,
              height: `${canvasDataHeight}px`,
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
              {t('hexViewer.contextMenu.copyOffset', {
                base: t(`hexViewer.contextMenu.bases.${config.ui.numberBase}`),
              })}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyHex}>
              {t('hexViewer.contextMenu.copyHexString')}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyText}>
              {t('hexViewer.contextMenu.copyAsciiText')}
            </ContextMenuItem>
          </ContextMenuList>
        </ContextMenu>
      )}
    </HexViewerContainer>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
