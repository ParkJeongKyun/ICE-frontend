import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useReducer,
} from 'react';
import { useTab } from '@/contexts/TabDataContext';
import { useScroll } from '@/contexts/TabDataContext';
import { useSelection } from '@/contexts/TabDataContext';
import { useWorker } from '@/contexts/WorkerContext';
import { useMessage } from '@/contexts/MessageContext';
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
} from './index.styles';
import { isMobile } from 'react-device-detect';
import { CHUNK_REQUEST_DEBOUNCE, LAYOUT, MIN_HEX_WIDTH, COLOR_KEYS, DEFAULT_COLORS } from '@/constants/hexViewer';
import { getDevicePixelRatio } from '@/utils/hexViewer';
import { useHexViewerCache } from './hooks/useHexViewerCache';
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

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (props, ref) => {
  const {
    activeData,
    encoding,
    activeKey,
  } = useTab();
  const { scrollPositions, setScrollPositions } = useScroll();
  const { activeSelectionState } = useSelection();
  const { fileWorker, getWorkerCache } = useWorker();
  const { showMessage } = useMessage();

  // ===== Basic States =====
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [, forceRender] = useReducer((x) => x + 1, 0);

  // ===== Refs =====
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const isInitialLoadingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
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

  // ===== Custom Hooks =====
  const { chunkCacheRef, requestedChunksRef, getByte, checkCacheSize } = useHexViewerCache();

  const firstRowRef = useRef(0);

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
  });

  const { directRender, renderHeader } = useHexViewerRender({
    canvasRef,
    headerCanvasRef,
    firstRowRef,
    colorsRef,
    getByte,
    canvasSizeRef,
    isInitialLoadingRef,
    hasValidDataRef,
  });

  const directRenderRef = useRef(directRender);

  const { requestChunks, initializeWorker } = useHexViewerWorker({
    chunkCacheRef,
    requestedChunksRef,
    onChunkLoaded: forceRender,
    isInitialLoadingRef,
    visibleRows,
    checkCacheSize,
  });

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

  const {
    shouldShowScrollbar: shouldShowXScrollbar,
    scrollbarWidth: horizontalScrollbarWidth,
    scrollbarLeft: horizontalScrollbarLeft,
    scrollbarDragging: horizontalScrollbarDragging,
    handleScrollbarMouseDown: handleHorizontalScrollbarMouseDown,
    handleScrollbarTouchStart: handleHorizontalScrollbarTouchStart,
    scrollbarDragEffect: horizontalScrollbarDragEffect,
  } = useHexViewerXScroll({
    containerRef,
  });

  // ===== Effects =====
  useEffect(() => {
    isDraggingRef.current = activeSelectionState?.isDragging ?? false;
  }, [activeSelectionState?.isDragging]);

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
    return horizontalScrollbarDragEffect();
  }, [horizontalScrollbarDragEffect]);

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
      setScrollPositions((prev) => ({ ...prev, [activeKey]: 0 }));

      (async () => {
        try {
          await initializeWorker(0);
          isInitialLoadingRef.current = false;
          forceRender();
          requestAnimationFrame(() => {
            directRenderRef.current();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          showMessage('FILE_PROCESSING_FAILED', `워커 초기화 실패: ${errorMessage}`);
        }
      })();
    }
  }, [file, activeKey, getWorkerCache, scrollPositions, requestChunks, visibleRows, fileSize, fileWorker, setScrollPositions, initializeWorker, showMessage]);

  useEffect(() => {
    canvasSizeRef.current = canvasSize;
    renderHeader();
  }, [canvasSize, renderHeader]);

  // 렌더링 트리거
  useEffect(() => {
    if (!isInitialLoadingRef.current && hasValidDataRef.current) {
      if (isDraggingRef.current) {
        // 드래그 중: RAF로 스케줄링하여 부드럽게
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          directRenderRef.current();
          rafRef.current = null;
        });
      } else {
        // 일반 상황: 즉시 렌더링
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        directRenderRef.current();
      }
    }
  }, [activeSelectionState, encoding, canvasSize, scrollPositions, activeKey]);

  useEffect(() => {
    if (!file || !fileWorker || isDraggingRef.current) return;
    const timer = setTimeout(() => {
      requestChunks(firstRowRef.current, fileWorker, file, fileSize, visibleRows + 30);
    }, CHUNK_REQUEST_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [file, visibleRows, fileSize, requestChunks, fileWorker]);

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
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // 커서 위치 변화 시 자동 스크롤
  useEffect(() => {
    if (activeSelectionState?.cursor === null) return;

    const cursorRow = Math.floor(activeSelectionState.cursor / bytesPerRow);
    const visibleStart = firstRowRef.current;
    const visibleEnd = visibleStart + visibleRows;

    // 커서가 화면 밖에 있으면 스크롤
    if (cursorRow < visibleStart) {
      setScrollPositions((prev) => ({
        ...prev,
        [activeKey]: cursorRow,
      }));
    } else if (cursorRow >= visibleEnd) {
      setScrollPositions((prev) => ({
        ...prev,
        [activeKey]: Math.max(0, cursorRow - visibleRows + 1),
      }));
    }
  }, [activeKey, activeSelectionState?.cursor, bytesPerRow, visibleRows, setScrollPositions]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, offset: number) => {
        const targetRow = Math.floor(index / bytesPerRow);
        updateScrollPosition(targetRow);

        const endIndex = offset > 0 ? Math.min(index + offset - 1, fileSize - 1) : index;
        setSelection(index, endIndex);
      },
    }),
    [updateScrollPosition, bytesPerRow, fileSize, setSelection]
  );

  // ===== Render =====
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
        onMouseDown={(e) => {
          // 캔테이너 포커스 처리
          e.currentTarget.focus();
        }}
      >
        <CanvasArea
          style={{
            minWidth: `${MIN_HEX_WIDTH}px`,
          }}
        >
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
            top: contextMenu.y - (containerRef.current?.getBoundingClientRect().top || 0),
            left: contextMenu.x - (containerRef.current?.getBoundingClientRect().left || 0),
          }}
          onClick={closeContextMenu}
          onBlur={closeContextMenu}
        >
          <ContextMenuList>
            <ContextMenuItem onClick={handleCopyOffset}>Copy Offset (Hex)</ContextMenuItem>
            <ContextMenuItem onClick={handleCopyHex}>Copy (Hex String)</ContextMenuItem>
            <ContextMenuItem onClick={handleCopyText}>Copy (ASCII Text)</ContextMenuItem>
          </ContextMenuList>
        </ContextMenu>
      )}
    </HexViewerContainer>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
