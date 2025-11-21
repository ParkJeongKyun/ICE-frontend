import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useTabData, EncodingType } from '@/contexts/TabDataContext';
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
} from '@/constants/hexViewer';
import { byteToHex, byteToChar } from '@/utils/encoding';

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

// ==================== 레이아웃 상수 ====================
const layout = {
  containerPadding: 10,
  gap: 10,
  bytesPerRow: 16,
  rowHeight: 22,
  font: '14px monospace',
  offsetWidth: 75,
  hexByteWidth: 26,
  asciiCharWidth: 12,
};

const layoutMobile = {
  containerPadding: 5,
  gap: 4,
  bytesPerRow: 16,
  rowHeight: 15,
  font: '9px monospace',
  offsetWidth: 44,
  hexByteWidth: 14,
  asciiCharWidth: 7,
};

const {
  containerPadding,
  gap,
  bytesPerRow,
  rowHeight,
  font,
  offsetWidth,
  hexByteWidth,
  asciiCharWidth,
} = isMobile ? layoutMobile : layout;

const offsetStartX = containerPadding;
const hexStartX = offsetStartX + offsetWidth + gap;
const asciiStartX = hexStartX + bytesPerRow * hexByteWidth + gap;

const minHexWidth =
  containerPadding * 2 +
  offsetWidth +
  gap * 2 +
  bytesPerRow * hexByteWidth +
  bytesPerRow * asciiCharWidth;

function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

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

  const chunkCacheRef = useRef<Map<number, Uint8Array>>(new Map());
  const workerRef = useRef<Worker | null>(null);
  const isInitialLoadingRef = useRef(false);
  // ✅ 청크 요청 중복 방지
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
        HEX_EVEN: style.getPropertyValue('--main-color_1').trim() || '#a0c0d8',
        HEX_ODD: style.getPropertyValue('--main-color').trim() || '#d8e8f0',
        ASCII: style.getPropertyValue('--main-color').trim() || '#d8e8f0',
        ASCII_DISABLED:
          style.getPropertyValue('--main-disabled-color').trim() || '#3a4754',
        SELECTED_BG:
          style.getPropertyValue('--main-hover-color').trim() || '#243240',
        SELECTED_TEXT:
          style.getPropertyValue('--ice-main-color').trim() || '#60c8ff',
        OFFSET:
          style.getPropertyValue('--ice-main-color_4').trim() || '#d8f0ff',
        BG: style.getPropertyValue('--main-bg-color').trim() || '#1a1f28',
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
          !chunkCacheRef.current.has(offset) &&
          !requestedChunksRef.current.has(offset)
        ) {
          requestedChunksRef.current.add(offset);
          // ✅ 우선순위 추가 - 현재 화면에 가까울수록 높은 우선순위
          const priority = Math.abs(offset - startByte);
          worker.postMessage({
            type: 'READ_CHUNK',
            file: currentFile,
            offset,
            length: Math.min(CHUNK_SIZE, currentFileSize - offset),
            priority, // 우선순위 전달
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

  // ✅ Worker 생성 최적화
  const createWorkerRef = useRef<((initialPosition: number) => null) | null>(
    null
  );

  createWorkerRef.current = useCallback(
    (initialPosition: number) => {
      if (!file) return null;

      // 이전 요청 기록 초기화
      requestedChunksRef.current.clear();

      const loadInitialChunk = async () => {
        try {
          const startByte = initialPosition * bytesPerRow;
          const chunkOffset = Math.floor(startByte / CHUNK_SIZE) * CHUNK_SIZE;
          const blob = file.slice(chunkOffset, chunkOffset + CHUNK_SIZE);
          const arrayBuffer = await blob.arrayBuffer();
          const data = new Uint8Array(arrayBuffer);

          const cache = new Map<number, Uint8Array>();
          cache.set(chunkOffset, data);
          chunkCacheRef.current = cache;
          requestedChunksRef.current.add(chunkOffset);

          setRenderTrigger((prev) => prev + 1);

          return cache;
        } catch (error) {
          console.error('초기 청크 로드 실패:', error);
          return new Map<number, Uint8Array>();
        }
      };

      // ✅ 배경 렌더링 최적화 - 색상 캐시 사용
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
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors.OFFSET;

        const renderRows = Math.ceil(currentCanvasSize.height / rowHeight) + 1;
        for (let drawRow = 0; drawRow < renderRows; drawRow++) {
          const row = initialPosition + drawRow;
          if (row >= rowCount) break;

          const y = drawRow * rowHeight;
          const offset = row * bytesPerRow;
          ctx.fillText(
            offset.toString(16).padStart(8, '0').toUpperCase(),
            offsetStartX + offsetWidth / 2,
            y + rowHeight / 2
          );
        }
        ctx.restore();
      });

      loadInitialChunk().then((initialCache) => {
        const worker = new Worker(
          new URL('../../workers/fileReader.worker.ts', import.meta.url)
        );

        worker.onmessage = (e) => {
          const { type, offset, data } = e.data;
          if (type === 'CHUNK_DATA') {
            initialCache.set(offset, data);
            chunkCacheRef.current = initialCache;

            if (!isDraggingRef.current) {
              setRenderTrigger((prev) => prev + 1);
            }
          }
        };

        const workerCache = { worker, cache: initialCache };
        setWorkerCache(activeKey, workerCache);
        chunkCacheRef.current = initialCache;
        workerRef.current = worker;

        requestChunks(
          initialPosition,
          worker,
          file,
          fileSize,
          visibleRows + 20
        );

        isInitialLoadingRef.current = false;
      });

      return null;
    },
    [
      file,
      fileSize,
      visibleRows,
      activeKey,
      setWorkerCache,
      requestChunks,
      rowCount,
    ]
  );

  const getByte = useCallback((index: number): number | null => {
    const chunkOffset = Math.floor(index / CHUNK_SIZE) * CHUNK_SIZE;
    const chunk = chunkCacheRef.current.get(chunkOffset);
    if (!chunk) return null;

    const localIndex = index - chunkOffset;
    // ✅ 범위 체크 추가
    if (localIndex < 0 || localIndex >= chunk.length) return null;

    const byteValue = chunk[localIndex];
    return byteValue !== undefined ? byteValue : null;
  }, []);

  // ✅ 렌더링 최적화 - 색상 캐시 사용
  const directRender = useCallback(() => {
    // ✅ 성능 측정 (개발 환경에서만)
    const perfStart =
      process.env.NODE_ENV === 'development' ? performance.now() : 0;

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
        offCtx.fillRect(offsetStartX, y + 2, offsetWidth, rowHeight - 4);
        offCtx.fillStyle = colors.SELECTED_TEXT;
      } else {
        offCtx.fillStyle = colors.OFFSET;
      }
      offCtx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        offsetStartX + offsetWidth / 2,
        y + rowHeight / 2
      );

      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= fileSize) break;

        const byte = getByte(idx);

        // ✅ null과 undefined 모두 체크
        if (byte === null || byte === undefined) {
          const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
          offCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
          offCtx.fillRect(
            xHex - hexByteWidth / 2 + 1,
            y + 2,
            hexByteWidth - 2,
            rowHeight - 4
          );

          const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
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

        // ✅ Hex 영역 렌더링
        const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
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

        // ✅ ASCII 영역 렌더링
        const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
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

    const hasEnoughData = validByteCount > renderRows * bytesPerRow * 0.3;
    const shouldRender =
      hasEnoughData ||
      !isDraggingRef.current ||
      !hasValidDataRef.current ||
      isInitialLoadingRef.current;

    if (shouldRender) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, currentCanvasSize.width, currentCanvasSize.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      if (validByteCount > 0) {
        hasValidDataRef.current = true;
      }

      // ✅ 성능 로그 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        const perfEnd = performance.now();
        const renderTime = perfEnd - perfStart;
        if (renderTime > 16.67) {
          // 60fps 기준
          console.warn(`[HexViewer] 느린 렌더링: ${renderTime.toFixed(2)}ms`);
        }
      }
    }
  }, [fileSize, rowCount, getByte]);

  const directRenderRef = useRef(directRender);
  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  const getByteIndexFromMouse = (x: number, y: number): number | null => {
    const row = firstRowRef.current + Math.floor(y / rowHeight);
    if (row < 0 || row >= rowCount) return null;

    if (x >= hexStartX && x < hexStartX + bytesPerRow * hexByteWidth) {
      const col = Math.floor((x - hexStartX) / hexByteWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      return idx >= fileSize ? null : idx;
    }

    if (x >= asciiStartX && x < asciiStartX + bytesPerRow * asciiCharWidth) {
      const col = Math.floor((x - asciiStartX) / asciiCharWidth);
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

  const handleScrollbarTouchMove = (e: TouchEvent) => {
    if (!scrollbarDragging || e.touches.length !== 1) return;
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
      if (workerRef.current && file) {
        requestChunks(
          nextRow,
          workerRef.current,
          file,
          fileSize,
          visibleRows + 50
        );
      }
    }
  };

  // 썸에 직접 non-passive touchmove 이벤트 등록
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
  }, [scrollbarDragging]);

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
      findAllByHex: async () => null,
      findAllByAsciiText: async () => null,
      scrollToIndex: (index: number, offset: number) => {
        // ✅ setFirstRow 대신 updateScrollPosition 사용
        const targetRow = Math.floor(index / bytesPerRow);
        updateScrollPosition(targetRow);
        updateSelection(index, index + offset - 1);
      },
    }),
    [fileSize, updateScrollPosition, updateSelection]
  );

  // ==================== useEffect - 3개로 축소 ====================

  // 1. ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const dpr = getDevicePixelRatio();
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = isMobile
          ? minHexWidth * dpr
          : Math.max(entry.contentRect.width, minHexWidth) * dpr;
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
    if (!file || !activeKey) return;

    if (tabInitialized.current.has(activeKey)) {
      const existingCache = getWorkerCache(activeKey);
      if (existingCache) {
        const savedPosition = scrollPositions[activeKey] ?? 0;

        requestedChunksRef.current.clear();
        existingCache.cache.forEach((_, offset) => {
          requestedChunksRef.current.add(offset);
        });

        chunkCacheRef.current = existingCache.cache;
        workerRef.current = existingCache.worker;
        firstRowRef.current = savedPosition;

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        setRenderTrigger((prev) => prev + 1);

        if (savedPosition > 0 || visibleRows > 0) {
          requestChunks(
            savedPosition,
            existingCache.worker,
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
      // ✅ Development 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log(`[HexViewer] 새 탭 생성: ${activeKey}`);
      }

      tabInitialized.current.add(activeKey);
      isInitialLoadingRef.current = true;
      hasValidDataRef.current = false;
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
  ]);

  // 3. 렌더링 및 Ref 동기화
  useEffect(() => {
    selectionRangeRef.current = selectionRange;
    encodingRef.current = encoding;
    canvasSizeRef.current = canvasSize;

    if (!isInitialLoadingRef.current) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        directRenderRef.current();
        rafRef.current = null;
      });
    }
  }, [renderTrigger, selectionRange, encoding, canvasSize]);

  // 4. 스크롤바 드래그
  useEffect(() => {
    if (!scrollbarDragging) return;

    isDraggingRef.current = true;

    if (workerRef.current && file) {
      requestChunks(
        firstRowRef.current,
        workerRef.current,
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

        if (workerRef.current && file) {
          requestChunks(
            nextRow,
            workerRef.current,
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
  ]);

  // 5. 청크 요청 debounce
  useEffect(() => {
    if (!file || !workerRef.current || isDraggingRef.current) return;

    const timer = setTimeout(() => {
      requestChunks(
        firstRowRef.current,
        workerRef.current!,
        file,
        fileSize,
        visibleRows + 30
      );
    }, CHUNK_REQUEST_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [renderTrigger, file, visibleRows, fileSize, requestChunks]);

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
        <CanvasArea style={{ minWidth: `${minHexWidth}px` }}>
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
