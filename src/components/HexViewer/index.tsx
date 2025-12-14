import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { useProcess } from '@/contexts/ProcessContext';
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
  CHUNK_SIZE,
  MAX_COPY_SIZE,
  COPY_CHUNK_SIZE,
  RENDER_INTERVAL,
  UPDATE_INTERVAL,
  CHUNK_REQUEST_DEBOUNCE,
  LAYOUT,
  OFFSET_START_X,
  HEX_START_X,
  ASCII_START_X,
  MIN_HEX_WIDTH,
  COLOR_KEYS,
  DEFAULT_COLORS,
} from '@/constants/hexViewer';
import { getDevicePixelRatio } from '@/utils/hexviewer';
import { byteToHex, byteToChar } from '@/utils/encoding';
import { asciiToBytes } from '@/utils/byteSearch';

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
  font,
  offsetWidth,
  hexByteWidth,
  asciiCharWidth,
} = LAYOUT;

// ==================== 메인 컴포넌트 ====================
const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  // ==================== Contexts ====================
  const {
    activeData,
    encoding,
    activeKey,
    scrollPositions,
    setScrollPositions,
    selectionStates,
    setSelectionStates,
    getWorkerCache,
    setWorkerCache,
  } = useTabData();
  const { setProcessInfo, fileWorker } = useProcess();

  const selectionRange = selectionStates[activeKey] || {
    start: null,
    end: null,
  };

  // ==================== 파일 정보 ====================
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  // ==================== Refs ====================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  // ✅ Worker 메시지 핸들러 ref 선언 추가
  const workerMessageHandlerRef = useRef<((e: MessageEvent) => void) | null>(
    null
  );

  // ✅ 단순 Map으로 복귀
  const chunkCacheRef = useRef<Map<number, Uint8Array>>(new Map());
  const isInitialLoadingRef = useRef(false);
  const requestedChunksRef = useRef<Set<number>>(new Set());

  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const selectionRangeRef = useRef(selectionRange);
  const encodingRef = useRef(encoding);
  const canvasSizeRef = useRef({ width: 800, height: 400 });
  const hasValidDataRef = useRef(false);

  // ✅ 스크롤 위치를 ref로만 관리 (state 제거)
  const firstRowRef = useRef(0);

  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  // ==================== State - 최소화 ====================
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);
  // ✅ 렌더링 트리거용 카운터
  const [renderTrigger, setRenderTrigger] = useState(0);

  // ==================== 계산된 값 ====================
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

  // ✅ CSS 변수 캐싱
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

  // ✅ CSS 변수 초기화/업데이트
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
    // 테마 변경 감지 (선택사항)
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // ==================== 유틸리티 함수 ====================
  // ✅ 청크 요청 최적화 - 중복 요청 방지
  const requestChunks = useCallback(
    (
      startRow: number,
      worker: Worker,
      currentFile: File,
      currentFileSize: number,
      currentVisibleRows: number
    ) => {
      const startByte = startRow * bytesPerRow;
      const endByte = Math.min(
        startByte + currentVisibleRows * bytesPerRow,
        currentFileSize
      );
      const startChunk = Math.floor(startByte / CHUNK_SIZE);
      const endChunk = Math.floor(endByte / CHUNK_SIZE);

      for (let i = startChunk; i <= endChunk; i++) {
        const offset = i * CHUNK_SIZE;
        if (
          !chunkCacheRef.current.has(offset) && // ✅ .has() 사용
          !requestedChunksRef.current.has(offset)
        ) {
          requestedChunksRef.current.add(offset);
          const priority = Math.abs(offset - startByte);
          worker.postMessage({
            type: 'READ_CHUNK',
            file: currentFile,
            offset,
            length: Math.min(CHUNK_SIZE, currentFileSize - offset),
            priority,
          });
        }
      }
    },
    []
  );

  // ✅ 스크롤 위치 업데이트 - Context에 즉시 저장
  const updateScrollPosition = useCallback(
    (position: number) => {
      firstRowRef.current = position;
      setScrollPositions((prev) => ({ ...prev, [activeKey]: position }));
      setRenderTrigger((prev) => prev + 1);
    },
    [activeKey, setScrollPositions]
  );

  // ✅ 선택 영역 업데이트
  const updateSelection = useCallback(
    (start: number | null, end: number | null) => {
      setSelectionStates((prev) => ({ ...prev, [activeKey]: { start, end } }));
    },
    [activeKey, setSelectionStates]
  );

  // ✅ 간단한 캐시 크기 체크 함수 추가
  const checkCacheSize = useCallback(() => {
    const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
    const cache = chunkCacheRef.current;

    let totalSize = 0;
    cache.forEach((chunk) => {
      totalSize += chunk.byteLength;
    });

    // 50MB 초과시 오래된 절반 제거
    if (totalSize > MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries());
      const halfIndex = Math.floor(entries.length / 2);

      // 앞쪽 절반 제거 (오래된 것)
      for (let i = 0; i < halfIndex; i++) {
        const [offset] = entries[i];
        cache.delete(offset);
        requestedChunksRef.current.delete(offset);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[HexViewer] Cache cleaned: ${entries.length} -> ${cache.size}`
        );
      }
    }
  }, []);

  // ✅ Worker 생성 최적화 - cleanup 추가
  const createWorkerRef = useRef<((initialPosition: number) => void) | null>(
    null
  );

  createWorkerRef.current = useCallback(
    (initialPosition: number) => {
      if (!file || !fileWorker) {
        console.warn(
          '[HexViewer] Cannot create worker cache: missing file or fileWorker'
        );
        return;
      }

      requestedChunksRef.current.clear();

      const loadInitialChunk = async () => {
        try {
          const startByte = initialPosition * bytesPerRow;
          const chunkOffset = Math.floor(startByte / CHUNK_SIZE) * CHUNK_SIZE;
          const blob = file.slice(chunkOffset, chunkOffset + CHUNK_SIZE);
          const arrayBuffer = await blob.arrayBuffer();
          const data = new Uint8Array(arrayBuffer);

          // ✅ 단순 Map 사용
          const cache = new Map<number, Uint8Array>();
          cache.set(chunkOffset, data);
          chunkCacheRef.current = cache;
          requestedChunksRef.current.add(chunkOffset);

          setRenderTrigger((prev) => prev + 1);

          return cache;
        } catch (error) {
          console.error('[HexViewer] 초기 청크 로드 실패:', error);
          return new Map<number, Uint8Array>();
        }
      };

      // ✅ 배경 렌더링
      requestAnimationFrame(() => {
        const ctx = canvasRef.current?.getContext('2d', { alpha: false });
        if (!ctx || !colorsRef.current) return;

        const currentCanvasSize = canvasSizeRef.current;
        const colors = colorsRef.current;
        const dpr = getDevicePixelRatio();

        ctx.fillStyle = colors.BG;
        ctx.fillRect(0, 0, currentCanvasSize.width, currentCanvasSize.height);

        ctx.save();
        ctx.scale(dpr, 1);
        ctx.font = LAYOUT.font; // ✅ 상수 사용
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors.OFFSET;

        const renderRows =
          Math.ceil(currentCanvasSize.height / LAYOUT.rowHeight) + 1;
        for (let drawRow = 0; drawRow < renderRows; drawRow++) {
          const row = initialPosition + drawRow;
          if (row >= rowCount) break;

          const y = drawRow * LAYOUT.rowHeight;
          const offset = row * LAYOUT.bytesPerRow;
          ctx.fillText(
            offset.toString(16).padStart(8, '0').toUpperCase(),
            OFFSET_START_X + LAYOUT.offsetWidth / 2,
            y + LAYOUT.rowHeight / 2
          );
        }
        ctx.restore();
      });

      loadInitialChunk().then((initialCache) => {
        const handleWorkerMessage = (e: MessageEvent) => {
          const { type, offset, data } = e.data;
          if (type === 'CHUNK_DATA') {
            initialCache.set(offset, data);
            chunkCacheRef.current = initialCache;

            // ✅ 캐시 크기 체크
            checkCacheSize();

            if (!isDraggingRef.current) {
              setRenderTrigger((prev) => prev + 1);
            }
          }
        };

        // ✅ 이전 핸들러 제거
        if (workerMessageHandlerRef.current) {
          fileWorker.removeEventListener(
            'message',
            workerMessageHandlerRef.current
          );
        }

        fileWorker.addEventListener('message', handleWorkerMessage);
        workerMessageHandlerRef.current = handleWorkerMessage;

        const workerCache = {
          worker: fileWorker,
          cache: initialCache,
          cleanup: () => {
            fileWorker.removeEventListener('message', handleWorkerMessage);
            // ✅ ref도 정리
            if (workerMessageHandlerRef.current === handleWorkerMessage) {
              workerMessageHandlerRef.current = null;
            }
          },
        };
        setWorkerCache(activeKey, workerCache);
        chunkCacheRef.current = initialCache;

        requestChunks(
          initialPosition,
          fileWorker,
          file,
          fileSize,
          visibleRows + 20
        );
        isInitialLoadingRef.current = false;
      });
    },
    [
      file,
      fileSize,
      visibleRows,
      activeKey,
      setWorkerCache,
      requestChunks,
      rowCount,
      fileWorker,
      checkCacheSize,
    ]
  );

  const getByte = useCallback((index: number): number | null => {
    const chunkOffset = Math.floor(index / CHUNK_SIZE) * CHUNK_SIZE;
    const chunk = chunkCacheRef.current.get(chunkOffset);
    if (!chunk) return null;

    const localIndex = index - chunkOffset;
    if (localIndex < 0 || localIndex >= chunk.length) return null;

    const byteValue = chunk[localIndex];
    return byteValue !== undefined ? byteValue : null;
  }, []);

  // ✅ 렌더링 최적화 - 색상 캐시 사용
  const directRender = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx || !colorsRef.current) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const offscreenCanvas = offscreenCanvasRef.current;
    const currentCanvasSize = canvasSizeRef.current;

    // ✅ 캔버스 크기가 변경된 경우에만 재설정
    if (
      offscreenCanvas.width !== currentCanvasSize.width ||
      offscreenCanvas.height !== currentCanvasSize.height
    ) {
      offscreenCanvas.width = currentCanvasSize.width;
      offscreenCanvas.height = currentCanvasSize.height;
    }

    const offCtx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!offCtx) return;

    const colors = colorsRef.current;
    const dpr = getDevicePixelRatio();

    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.fillStyle = colors.BG;
    offCtx.fillRect(0, 0, currentCanvasSize.width, currentCanvasSize.height);
    offCtx.save();
    offCtx.scale(dpr, 1);
    offCtx.font = font;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const renderRows = Math.ceil(currentCanvasSize.height / rowHeight) + 1;
    const currentFirstRow = firstRowRef.current;
    const currentSelectionRange = selectionRangeRef.current;
    const currentEncoding = encodingRef.current;

    let validByteCount = 0;

    for (
      let row = currentFirstRow, drawRow = 0;
      row < Math.min(rowCount, currentFirstRow + renderRows) &&
      drawRow * rowHeight < currentCanvasSize.height;
      row++, drawRow++
    ) {
      const y = drawRow * rowHeight;
      const offset = row * bytesPerRow;
      const offsetStart = row * bytesPerRow;
      const offsetEnd = Math.min(offsetStart + bytesPerRow - 1, fileSize - 1);
      const selStart = currentSelectionRange.start;
      const selEnd = currentSelectionRange.end;
      const isOffsetSel =
        selStart !== null &&
        selEnd !== null &&
        offsetStart <= Math.max(selStart, selEnd) &&
        offsetEnd >= Math.min(selStart, selEnd);

      if (isOffsetSel) {
        offCtx.fillStyle = colors.SELECTED_BG;
        offCtx.fillRect(OFFSET_START_X, y + 2, offsetWidth, rowHeight - 4);
        offCtx.fillStyle = colors.SELECTED_TEXT;
      } else {
        offCtx.fillStyle = colors.OFFSET;
      }
      offCtx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        OFFSET_START_X + offsetWidth / 2,
        y + rowHeight / 2
      );

      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= fileSize) break;

        const byte = getByte(idx);

        if (byte === null || byte === undefined) {
          const xHex = HEX_START_X + i * hexByteWidth + hexByteWidth / 2;
          offCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
          offCtx.fillRect(
            xHex - hexByteWidth / 2 + 1,
            y + 2,
            hexByteWidth - 2,
            rowHeight - 4
          );

          const xAsc = ASCII_START_X + i * asciiCharWidth + asciiCharWidth / 2;
          offCtx.fillRect(
            xAsc - asciiCharWidth / 2 + 1,
            y + 2,
            asciiCharWidth - 2,
            rowHeight - 4
          );
          continue;
        }

        validByteCount++;

        const isSel =
          selStart !== null &&
          selEnd !== null &&
          idx >= Math.min(selStart, selEnd) &&
          idx <= Math.max(selStart, selEnd);

        const xHex = HEX_START_X + i * hexByteWidth + hexByteWidth / 2;
        const yHex = y + rowHeight / 2;
        if (isSel) {
          offCtx.fillStyle = colors.SELECTED_BG;
          offCtx.fillRect(
            xHex - hexByteWidth / 2 + 1,
            y + 2,
            hexByteWidth - 2,
            rowHeight - 4
          );
          offCtx.fillStyle = colors.SELECTED_TEXT;
        } else {
          offCtx.fillStyle = i % 2 === 0 ? colors.HEX_EVEN : colors.HEX_ODD;
        }
        offCtx.fillText(byteToHex(byte), xHex, yHex);

        const xAsc = ASCII_START_X + i * asciiCharWidth + asciiCharWidth / 2;
        const yAsc = y + rowHeight / 2;
        const char = byteToChar(byte, currentEncoding);
        if (isSel) {
          offCtx.fillStyle = colors.SELECTED_BG;
          offCtx.fillRect(
            xAsc - asciiCharWidth / 2 + 1,
            y + 2,
            asciiCharWidth - 2,
            rowHeight - 4
          );
          offCtx.fillStyle = colors.SELECTED_TEXT;
        } else {
          offCtx.fillStyle =
            char === '.' ? colors.ASCII_DISABLED : colors.ASCII;
        }
        offCtx.fillText(char, xAsc, yAsc);
      }
    }
    offCtx.restore();

    // ✅ 렌더링 조건 완화 - 데이터가 조금이라도 있으면 렌더링
    const hasEnoughData = validByteCount > 0; // ✅ 30% -> 0으로 변경
    const shouldRender = hasEnoughData || isInitialLoadingRef.current;

    if (shouldRender) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreenCanvas, 0, 0);

      if (validByteCount > 0) {
        hasValidDataRef.current = true;
      }
    }

    // ✅ 프로덕션에서는 성능 로그 제거
    // if (process.env.NODE_ENV === 'development') {
    //   const perfEnd = performance.now();
    //   const renderTime = perfEnd - perfStart;
    //   if (renderTime > 16.67) {
    //     console.warn(`[HexViewer] 느린 렌더링: ${renderTime.toFixed(2)}ms`);
    //   }
    // }
  }, [fileSize, rowCount, getByte]);

  const directRenderRef = useRef(directRender);
  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  const getByteIndexFromMouse = (x: number, y: number): number | null => {
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
  };

  // ==================== 이벤트 핸들러 ====================
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const nextRow =
        e.deltaY > 0
          ? Math.min(firstRowRef.current + 1, maxFirstRow)
          : Math.max(firstRowRef.current - 1, 0);
      if (nextRow !== firstRowRef.current) {
        updateScrollPosition(nextRow);
      }
    },
    [maxFirstRow, updateScrollPosition]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const idx = getByteIndexFromMouse(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    if (idx !== null) {
      setIsDragging(true);
      updateSelection(idx, idx);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const idx = getByteIndexFromMouse(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    if (idx !== null) {
      const current = selectionStates[activeKey];
      if (current?.start !== null) {
        updateSelection(current.start, idx);
      }
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };
  const closeContextMenu = () => setContextMenu(null);

  const handleScrollbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setScrollbarDragging(true);
    isDraggingRef.current = true;
    setScrollbarStartY(e.clientY);
    setScrollbarStartRow(firstRowRef.current);
    document.body.style.userSelect = 'none';
  };

  const handleScrollbarTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setScrollbarDragging(true);
      isDraggingRef.current = true;
      setScrollbarStartY(e.touches[0].clientY);
      setScrollbarStartRow(firstRowRef.current);
      document.body.style.userSelect = 'none';
    }
  };

  const handleScrollbarTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!scrollbarDragging || e.touches.length !== 1 || !fileWorker || !file)
        return;

      e.preventDefault(); // ✅ 스크롤 방지

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
        requestChunks(nextRow, fileWorker, file, fileSize, visibleRows + 50);
      }
    },
    [
      scrollbarDragging,
      scrollbarStartY,
      canvasSize.height,
      scrollbarHeight,
      rowCount,
      visibleRows,
      scrollbarStartRow,
      maxFirstRow,
      updateScrollPosition,
      fileWorker,
      file,
      fileSize,
      requestChunks,
    ]
  );

  useLayoutEffect(() => {
    const thumb = scrollbarRef.current;
    if (!thumb) return;

    if (scrollbarDragging) {
      thumb.addEventListener('touchmove', handleScrollbarTouchMove, {
        passive: false,
      });
    }

    return () => {
      thumb.removeEventListener('touchmove', handleScrollbarTouchMove);
    };
  }, [scrollbarDragging, handleScrollbarTouchMove]);

  const handleScrollbarTouchEnd = () => {
    setScrollbarDragging(false);
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    setRenderTrigger((prev) => prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartRowRef.current = firstRowRef.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 썸 드래그 중이면 전체 영역 터치 스크롤 무시
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
      if (nextRow !== firstRowRef.current) {
        updateScrollPosition(nextRow);
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  };

  // ✅ 복사 로직 통합
  const handleCopy = useCallback(
    async (format: 'hex' | 'text') => {
      const current = selectionStates[activeKey];
      if (current?.start !== null && current?.end !== null && file) {
        const start = Math.min(current.start, current.end);
        const end = Math.max(current.start, current.end) + 1;
        const size = end - start;
        const actualEnd = start + Math.min(size, MAX_COPY_SIZE);

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

  // ==================== useImperativeHandle ====================
  // ✅ 검색 ID를 useRef로 관리하여 이전 검색 취소
  const hexSearchIdRef = useRef<number>(0);
  const asciiSearchIdRef = useRef<number>(0);
  const searchCleanupRef = useRef<Map<number, () => void>>(new Map());

  useImperativeHandle(
    ref,
    () => ({
      findByOffset: async (offset: string) => {
        if (offset.trim()) {
          const byteOffset = parseInt(offset, 16);
          if (!isNaN(byteOffset) && byteOffset >= 0 && byteOffset < fileSize) {
            return { index: byteOffset, offset: 1 };
          }
        }
        return null;
      },
      findAllByHex: async (hex: string) => {
        if (!file || !hex.trim() || !fileWorker) return null;

        // ✅ 검색 시작 시점의 탭 기록
        const searchStartTabKey = activeKey;

        setProcessInfo({
          status: 'processing',
          type: 'Hex',
          message: '검색중...',
        });

        const hexPattern = hex.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
        if (hexPattern.length % 2 !== 0) {
          setProcessInfo({
            status: 'failure',
            type: 'Hex',
            message: 'HEX 길이 오류',
          });
          return null;
        }

        const patternBytes = new Uint8Array(
          hexPattern.match(/.{2}/g)!.map((b) => parseInt(b, 16))
        );

        // ✅ 이전 검색 명시적으로 취소
        const prevSearchId = hexSearchIdRef.current;
        if (prevSearchId > 0) {
          fileWorker.postMessage({
            type: 'CANCEL_SEARCH',
            searchId: prevSearchId,
          });
          const prevCleanup = searchCleanupRef.current.get(prevSearchId);
          if (prevCleanup) {
            prevCleanup();
            searchCleanupRef.current.delete(prevSearchId);
          }
        }

        // 새 검색 ID 생성
        hexSearchIdRef.current += 1;
        const searchId = hexSearchIdRef.current;

        return new Promise<IndexInfo[] | null>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            cleanup();
            setProcessInfo({
              status: 'failure',
              type: 'Hex',
              message: '검색 타임아웃',
            });
            reject(new Error('Search timeout'));
          }, 30000);

          const handleMessage = (e: MessageEvent) => {
            if (
              e.data.type === 'SEARCH_RESULT_HEX' &&
              e.data.searchId === searchId
            ) {
              cleanup();

              // ✅ 탭이 바뀌었으면 결과 무시
              if (searchStartTabKey !== activeKey) {
                console.log('[HexViewer] 탭 변경으로 검색 결과 무시');
                resolve(null);
                return;
              }

              if (e.data.results && e.data.results.length > 0) {
                setProcessInfo({
                  status: 'success',
                  type: 'Hex',
                  message: `검색 성공 (${e.data.results.length}개)${e.data.usedWasm ? ' [WASM]' : ' [JS]'}`,
                });
              } else {
                setProcessInfo({
                  status: 'success',
                  type: 'Hex',
                  message: '검색 결과 없음',
                });
              }
              resolve(e.data.results);
            }
          };

          const cleanup = () => {
            clearTimeout(timeoutId);
            fileWorker.removeEventListener('message', handleMessage);
            searchCleanupRef.current.delete(searchId);
          };

          searchCleanupRef.current.set(searchId, cleanup);
          fileWorker.addEventListener('message', handleMessage);
          fileWorker.postMessage({
            type: 'SEARCH_HEX',
            file,
            pattern: patternBytes,
            searchId,
          });
        });
      },
      findAllByAsciiText: async (text: string, ignoreCase: boolean) => {
        if (!file || !text.trim() || !fileWorker) return null;

        // ✅ 동일하게 적용
        const searchStartTabKey = activeKey;

        setProcessInfo({
          status: 'processing',
          type: 'Ascii',
          message: '검색중...',
        });

        const patternBytes = asciiToBytes(text);

        // ✅ 이전 검색 명시적으로 취소
        const prevSearchId = asciiSearchIdRef.current;
        if (prevSearchId > 0) {
          fileWorker.postMessage({
            type: 'CANCEL_SEARCH',
            searchId: prevSearchId,
          });
          const prevCleanup = searchCleanupRef.current.get(prevSearchId);
          if (prevCleanup) {
            prevCleanup();
            searchCleanupRef.current.delete(prevSearchId);
          }
        }

        // 새 검색 ID 생성
        asciiSearchIdRef.current += 1;
        const searchId = asciiSearchIdRef.current;

        return new Promise<IndexInfo[] | null>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            cleanup();
            setProcessInfo({
              status: 'failure',
              type: 'Ascii',
              message: '검색 타임아웃',
            });
            reject(new Error('Search timeout'));
          }, 30000);

          const handleMessage = (e: MessageEvent) => {
            if (
              e.data.type === 'SEARCH_RESULT_ASCII' &&
              e.data.searchId === searchId
            ) {
              cleanup();

              // ✅ 탭이 바뀌었으면 결과 무시
              if (searchStartTabKey !== activeKey) {
                console.log('[HexViewer] 탭 변경으로 검색 결과 무시');
                resolve(null);
                return;
              }

              if (e.data.results && e.data.results.length > 0) {
                setProcessInfo({
                  status: 'success',
                  type: 'Ascii',
                  message: `검색 성공 (${e.data.results.length}개)${e.data.usedWasm ? ' [WASM]' : ' [JS]'}`,
                });
              } else {
                setProcessInfo({
                  status: 'success',
                  type: 'Ascii',
                  message: '검색 결과 없음',
                });
              }
              resolve(e.data.results);
            }
          };

          const cleanup = () => {
            clearTimeout(timeoutId);
            fileWorker.removeEventListener('message', handleMessage);
            searchCleanupRef.current.delete(searchId);
          };

          searchCleanupRef.current.set(searchId, cleanup);
          fileWorker.addEventListener('message', handleMessage);
          fileWorker.postMessage({
            type: 'SEARCH_ASCII',
            file,
            pattern: patternBytes,
            ignoreCase,
            searchId,
          });
        });
      },
      scrollToIndex: (index: number, offset: number) => {
        const targetRow = Math.floor(index / bytesPerRow);
        updateScrollPosition(targetRow);
        updateSelection(index, index + offset - 1);
      },
    }),
    [
      file,
      fileSize,
      updateScrollPosition,
      updateSelection,
      setProcessInfo,
      fileWorker,
      activeKey, // ✅ 의존성 추가
    ]
  );

  // ✅ 컴포넌트 언마운트 시 모든 검색 및 Worker 리스너 정리
  useEffect(() => {
    return () => {
      // 모든 검색 cleanup 실행
      searchCleanupRef.current.forEach((cleanup) => cleanup());
      searchCleanupRef.current.clear();

      // Worker 메시지 핸들러 제거
      if (workerMessageHandlerRef.current && fileWorker) {
        fileWorker.removeEventListener(
          'message',
          workerMessageHandlerRef.current
        );
        workerMessageHandlerRef.current = null;
      }

      // 진행 중인 애니메이션 프레임 취소
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [fileWorker]);

  // ==================== useEffect ====================

  // 1. ResizeObserver
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

  // 2. 탭 전환 및 Worker 관리
  const tabInitialized = useRef(new Set<string>());

  useEffect(() => {
    if (!file || !activeKey || !fileWorker) return;

    if (tabInitialized.current.has(activeKey)) {
      const existingCache = getWorkerCache(activeKey);
      if (existingCache) {
        const savedPosition = scrollPositions[activeKey] ?? 0;

        requestedChunksRef.current.clear();
        // ✅ 단순 Map 순회
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[HexViewer] 새 탭 생성: ${activeKey}`);
      }

      tabInitialized.current.add(activeKey);
      isInitialLoadingRef.current = true;
      hasValidDataRef.current = false;

      // ✅ 단순 Map으로 초기화
      chunkCacheRef.current = new Map();
      requestedChunksRef.current.clear();
      firstRowRef.current = 0;

      setScrollPositions((prev) => {
        if (prev[activeKey] === 0) return prev;
        return { ...prev, [activeKey]: 0 };
      });

      createWorkerRef.current?.(0);
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
  ]);

  // 3. 렌더링 및 Ref 동기화
  useEffect(() => {
    selectionRangeRef.current = selectionRange;
    encodingRef.current = encoding;
    canvasSizeRef.current = canvasSize;

    if (!isInitialLoadingRef.current) {
      // ✅ 즉시 렌더링 (RAF 제거로 깜빡임 감소)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      // ✅ 드래그 중이 아닐 때만 즉시 렌더링
      if (!isDraggingRef.current) {
        directRenderRef.current();
      } else {
        // 드래그 중에는 RAF 사용
        rafRef.current = requestAnimationFrame(() => {
          directRenderRef.current();
          rafRef.current = null;
        });
      }
    }
  }, [renderTrigger, selectionRange, encoding, canvasSize]);

  // 4. 스크롤바 드래그
  useEffect(() => {
    if (!scrollbarDragging || !fileWorker) return; // ✅ fileWorker 체크

    isDraggingRef.current = true;

    if (file) {
      requestChunks(
        firstRowRef.current,
        fileWorker, // ✅ fileWorker 사용
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
          requestChunks(
            nextRow,
            fileWorker, // ✅ fileWorker 사용
            file,
            fileSize,
            visibleRows + 50
          );
        }
      });
    };

    const handleEnd = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (periodicRafId !== null) cancelAnimationFrame(periodicRafId);
      setScrollbarDragging(false);
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      setRenderTrigger((prev) => prev + 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (periodicRafId !== null) cancelAnimationFrame(periodicRafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
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
    fileWorker, // ✅ 의존성 추가
  ]);

  // 5. 청크 요청 debounce
  useEffect(() => {
    if (!file || !fileWorker || isDraggingRef.current) return; // ✅ fileWorker 체크

    const timer = setTimeout(() => {
      requestChunks(
        firstRowRef.current,
        fileWorker, // ✅ fileWorker 사용
        file,
        fileSize,
        visibleRows + 30
      );
    }, CHUNK_REQUEST_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [renderTrigger, file, visibleRows, fileSize, requestChunks, fileWorker]); // ✅ 의존성 추가

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

  // ==================== Render ====================
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
            onTouchEnd={handleScrollbarTouchEnd}
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
