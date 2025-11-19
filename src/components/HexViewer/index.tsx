import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { useSelection } from '@/contexts/SelectionContext';
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

// ==================== 헬퍼 함수 ====================
function byteToHex(byte: number): string {
  return ('0' + byte.toString(16)).slice(-2).toUpperCase();
}

function byteToChar(byte: number, encoding: EncodingType): string {
  if (encoding === 'ascii') {
    return byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.';
  }
  try {
    const decoder = new TextDecoder(encoding);
    const char = decoder.decode(new Uint8Array([byte]));
    const code = char.charCodeAt(0);
    if (
      (encoding === 'windows-1252' &&
        ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff))) ||
      (encoding === 'utf-8' && code >= 0x20) ||
      (encoding === 'latin1' && code >= 0x20 && code <= 0xff)
    ) {
      return char;
    }
  } catch {}
  return '.';
}

function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

// ==================== 메인 컴포넌트 ====================
const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  // ==================== Contexts ====================
  const { activeData, encoding, activeKey, scrollPositions, setScrollPositions } = useTabData();
  const { selectionRange, setSelectionRange } = useSelection();
  
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

  const workerCacheRef = useRef<Map<string, {
    worker: Worker;
    cache: Map<number, Uint8Array>;
  }>>(new Map());
  const chunkCacheRef = useRef<Map<number, Uint8Array>>(new Map());
  const workerRef = useRef<Worker | null>(null);
  const isInitialLoadingRef = useRef(false);
  const previousActiveKeyRef = useRef<string>('');

  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const selectionRangeRef = useRef(selectionRange);
  const encodingRef = useRef(encoding);
  const canvasSizeRef = useRef({ width: 800, height: 400 });
  const hasValidDataRef = useRef(false);
  const firstRowRef = useRef(0);

  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  // ==================== State ====================
  const [firstRow, setFirstRow] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);

  // ==================== 계산된 값 ====================
  const visibleRows = Math.floor(canvasSize.height / rowHeight);
  const maxFirstRow = Math.max(0, rowCount - visibleRows);
  const scrollbarAreaHeight = canvasSize.height;
  const scrollbarHeight = Math.max(30, (visibleRows / rowCount) * scrollbarAreaHeight);
  const maxScrollbarTop = scrollbarAreaHeight - scrollbarHeight;
  const scrollbarTop = Math.min(maxScrollbarTop, (firstRow / maxFirstRow) * maxScrollbarTop || 0);

  // ==================== 유틸리티 함수 ====================
  const requestChunks = useCallback((startRow: number, worker: Worker, currentFile: File, currentFileSize: number, currentVisibleRows: number) => {
    const CHUNK_SIZE = 256 * 1024;
    const startByte = startRow * bytesPerRow;
    const endByte = Math.min(startByte + currentVisibleRows * bytesPerRow, currentFileSize);
    const startChunk = Math.floor(startByte / CHUNK_SIZE);
    const endChunk = Math.floor(endByte / CHUNK_SIZE);
    
    for (let i = startChunk; i <= endChunk; i++) {
      const offset = i * CHUNK_SIZE;
      if (!chunkCacheRef.current.has(offset)) {
        worker.postMessage({
          type: 'READ_CHUNK',
          file: currentFile,
          offset,
          length: Math.min(CHUNK_SIZE, currentFileSize - offset),
        });
      }
    }
  }, []);

  const getByte = useCallback((index: number): number | null => {
    const CHUNK_SIZE = 256 * 1024;
    const chunkOffset = Math.floor(index / CHUNK_SIZE) * CHUNK_SIZE;
    const chunk = chunkCacheRef.current.get(chunkOffset);
    if (!chunk) return null;
    return chunk[index - chunkOffset];
  }, []);

  const directRender = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    
    const offscreenCanvas = offscreenCanvasRef.current;
    const currentCanvasSize = canvasSizeRef.current;
    offscreenCanvas.width = currentCanvasSize.width;
    offscreenCanvas.height = currentCanvasSize.height;
    const offCtx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!offCtx) return;
    
    const style = getComputedStyle(document.documentElement);
    const COLOR_HEX_EVEN = style.getPropertyValue('--main-color_1').trim() || '#a0c0d8';
    const COLOR_HEX_ODD = style.getPropertyValue('--main-color').trim() || '#d8e8f0';
    const COLOR_ASCII = style.getPropertyValue('--main-color').trim() || '#d8e8f0';
    const COLOR_ASCII_DISABLED = style.getPropertyValue('--main-disabled-color').trim() || '#3a4754';
    const COLOR_SELECTED_BG = style.getPropertyValue('--main-hover-color').trim() || '#243240';
    const COLOR_SELECTED_TEXT = style.getPropertyValue('--ice-main-color').trim() || '#60c8ff';
    const COLOR_OFFSET = style.getPropertyValue('--ice-main-color_4').trim() || '#d8f0ff';
    const COLOR_BG = style.getPropertyValue('--main-bg-color').trim() || '#1a1f28';

    const dpr = getDevicePixelRatio();
    
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.fillStyle = COLOR_BG;
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
        offCtx.fillStyle = COLOR_SELECTED_BG;
        offCtx.fillRect(offsetStartX, y + 2, offsetWidth, rowHeight - 4);
        offCtx.fillStyle = COLOR_SELECTED_TEXT;
      } else {
        offCtx.fillStyle = COLOR_OFFSET;
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
        
        if (byte === null) {
          const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
          offCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
          offCtx.fillRect(xHex - hexByteWidth / 2 + 1, y + 2, hexByteWidth - 2, rowHeight - 4);
          
          const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
          offCtx.fillRect(xAsc - asciiCharWidth / 2 + 1, y + 2, asciiCharWidth - 2, rowHeight - 4);
          continue;
        }
        
        validByteCount++;
        
        const isSel =
          selStart !== null &&
          selEnd !== null &&
          idx >= Math.min(selStart, selEnd) &&
          idx <= Math.max(selStart, selEnd);

        const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
        const yHex = y + rowHeight / 2;
        if (isSel) {
          offCtx.fillStyle = COLOR_SELECTED_BG;
          offCtx.fillRect(xHex - hexByteWidth / 2 + 1, y + 2, hexByteWidth - 2, rowHeight - 4);
          offCtx.fillStyle = COLOR_SELECTED_TEXT;
        } else {
          offCtx.fillStyle = i % 2 === 0 ? COLOR_HEX_EVEN : COLOR_HEX_ODD;
        }
        offCtx.fillText(byteToHex(byte), xHex, yHex);

        const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
        const yAsc = y + rowHeight / 2;
        const char = byteToChar(byte, currentEncoding);
        if (isSel) {
          offCtx.fillStyle = COLOR_SELECTED_BG;
          offCtx.fillRect(xAsc - asciiCharWidth / 2 + 1, y + 2, asciiCharWidth - 2, rowHeight - 4);
          offCtx.fillStyle = COLOR_SELECTED_TEXT;
        } else {
          offCtx.fillStyle = char === '.' ? COLOR_ASCII_DISABLED : COLOR_ASCII;
        }
        offCtx.fillText(char, xAsc, yAsc);
      }
    }
    offCtx.restore();
    
    const hasEnoughData = validByteCount > (renderRows * bytesPerRow * 0.3);
    if (hasEnoughData || !isDraggingRef.current || !hasValidDataRef.current) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, currentCanvasSize.width, currentCanvasSize.height);
      ctx.drawImage(offscreenCanvas, 0, 0);
      
      if (validByteCount > 0) {
        hasValidDataRef.current = true;
      }
    }
  }, [fileSize, rowCount, getByte]);

  const directRenderRef = useRef(directRender);
  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      directRenderRef.current();
      rafRef.current = null;
    });
  }, []);

  const getByteIndexFromMouse = (x: number, y: number): number | null => {
    const row = firstRow + Math.floor(y / rowHeight);
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
      const nextRow = e.deltaY > 0
        ? Math.min(firstRow + 1, maxFirstRow)
        : Math.max(firstRow - 1, 0);
      if (nextRow !== firstRow) setFirstRow(nextRow);
    },
    [firstRow, maxFirstRow]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const idx = getByteIndexFromMouse(e.clientX - rect.left, e.clientY - rect.top);
    if (idx !== null) {
      setIsDragging(true);
      setSelectionRange({ ...selectionRange, start: idx, end: idx });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const idx = getByteIndexFromMouse(e.clientX - rect.left, e.clientY - rect.top);
    if (idx !== null) {
      setSelectionRange((prev) => ({ ...prev, end: idx }));
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
    setScrollbarStartRow(firstRow);
    document.body.style.userSelect = 'none';
  };

  const handleScrollbarTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setScrollbarDragging(true);
      isDraggingRef.current = true;
      setScrollbarStartY(e.touches[0].clientY);
      setScrollbarStartRow(firstRow);
      document.body.style.userSelect = 'none';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartRowRef.current = firstRow;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartYRef.current !== null && touchStartRowRef.current !== null) {
      const deltaY = e.touches[0].clientY - touchStartYRef.current;
      const rowDelta = -Math.round(deltaY / rowHeight);
      const nextRow = Math.max(0, Math.min(touchStartRowRef.current + rowDelta, maxFirstRow));
      setFirstRow(nextRow);
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  };

  const handleCopyHex = useCallback(async () => {
    if (selectionRange.start !== null && selectionRange.end !== null && file) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const size = end - start;
      const MAX_COPY_SIZE = 256 * 1024;
      const actualEnd = start + Math.min(size, MAX_COPY_SIZE);
      
      try {
        const arrayBuffer = await file.slice(start, actualEnd).arrayBuffer();
        const selected = new Uint8Array(arrayBuffer);
        const CHUNK_SIZE = 100000;
        let hex = '';
        for (let i = 0; i < selected.length; i += CHUNK_SIZE) {
          const chunk = selected.slice(i, Math.min(i + CHUNK_SIZE, selected.length));
          hex += Array.from(chunk).map((b) => b.toString(16).padStart(2, '0')).join(' ') + ' ';
        }
        await navigator.clipboard.writeText(hex.trim());
      } catch (error) {
        console.error('HEX 복사 실패:', error);
        alert('복사 실패: ' + (error as Error).message);
      }
    }
    setContextMenu(null);
  }, [selectionRange, file]);

  const handleCopyText = useCallback(async () => {
    if (selectionRange.start !== null && selectionRange.end !== null && file) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const size = end - start;
      const MAX_COPY_SIZE = 256 * 1024;
      const actualEnd = start + Math.min(size, MAX_COPY_SIZE);
      
      try {
        const arrayBuffer = await file.slice(start, actualEnd).arrayBuffer();
        const selected = new Uint8Array(arrayBuffer);
        const CHUNK_SIZE = 100000;
        let text = '';
        for (let i = 0; i < selected.length; i += CHUNK_SIZE) {
          const chunk = selected.slice(i, Math.min(i + CHUNK_SIZE, selected.length));
          text += Array.from(chunk).map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.')).join('');
        }
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('텍스트 복사 실패:', error);
        alert('복사 실패: ' + (error as Error).message);
      }
    }
    setContextMenu(null);
  }, [selectionRange, file]);

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
        setFirstRow(Math.floor(index / bytesPerRow));
        setSelectionRange({
          start: index,
          end: index + offset - 1,
          arrayBuffer: null,
        });
      },
    }),
    [fileSize, setSelectionRange]
  );

  // ==================== useEffect (라이프사이클 순서대로) ====================
  
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
          prev.width !== width || prev.height !== height ? { width, height } : prev
        );
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Worker 초기화 및 탭 전환
  useEffect(() => {
    if (!file || !activeKey) return;
    
    let tabWorkerCache = workerCacheRef.current.get(activeKey);
    
    if (!tabWorkerCache) {
      isInitialLoadingRef.current = true;
      hasValidDataRef.current = false;
      
      setFirstRow(0);
      firstRowRef.current = 0;
      
      const worker = new Worker(
        new URL('../../workers/fileReader.worker.ts', import.meta.url)
      );
      
      const cache = new Map<number, Uint8Array>();
      let initialChunkLoaded = false;
      
      worker.onmessage = (e) => {
        const { type, offset, data } = e.data;
        if (type === 'CHUNK_DATA') {
          cache.set(offset, data);
          chunkCacheRef.current = cache;
          
          if (!initialChunkLoaded) {
            initialChunkLoaded = true;
            isInitialLoadingRef.current = false;
            requestAnimationFrame(() => directRenderRef.current());
          } else if (!isDraggingRef.current) {
            directRenderRef.current();
          }
        }
      };
      
      tabWorkerCache = { worker, cache };
      workerCacheRef.current.set(activeKey, tabWorkerCache);
      chunkCacheRef.current = cache;
      workerRef.current = worker;
      requestChunks(0, worker, file, fileSize, visibleRows);
      
      return;
    }
    
    isInitialLoadingRef.current = false;
    chunkCacheRef.current = tabWorkerCache.cache;
    workerRef.current = tabWorkerCache.worker;
    
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (previousActiveKeyRef.current !== activeKey) {
      previousActiveKeyRef.current = activeKey;
      const savedPosition = scrollPositions[activeKey] ?? 0;
      
      if (savedPosition !== firstRowRef.current) {
        setFirstRow(savedPosition);
        firstRowRef.current = savedPosition;
        
        if (savedPosition > 0) {
          requestChunks(savedPosition, workerRef.current, file, fileSize, visibleRows);
        }
      }
    }
    
    requestAnimationFrame(() => directRenderRef.current());
  }, [file, activeKey, visibleRows, fileSize, requestChunks, scrollPositions]);

  // 3. Worker 정리
  useEffect(() => {
    return () => {
      workerCacheRef.current.forEach(({ worker }) => worker.terminate());
      workerCacheRef.current.clear();
    };
  }, []);

  // 4. Ref 동기화
  useEffect(() => {
    selectionRangeRef.current = selectionRange;
    encodingRef.current = encoding;
    canvasSizeRef.current = canvasSize;
  }, [selectionRange, encoding, canvasSize]);

  // 5. 렌더링 트리거
  useEffect(() => {
    firstRowRef.current = firstRow;
    if (!isDraggingRef.current) {
      scheduleRender();
    }
  }, [
    firstRow,
    selectionRange.start,
    selectionRange.end,
    canvasSize.width,
    canvasSize.height,
    encoding,
    scheduleRender
  ]);

  // 6. 스크롤 위치 저장
  useEffect(() => {
    if (activeKey && !isInitialLoadingRef.current) {
      setScrollPositions((prev) => {
        if (prev[activeKey] === firstRow) return prev;
        return { ...prev, [activeKey]: firstRow };
      });
    }
  }, [firstRow, activeKey, setScrollPositions]);

  // 7. 터치 스크롤
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && touchStartYRef.current !== null && touchStartRowRef.current !== null) {
        const deltaY = e.touches[0].clientY - touchStartYRef.current;
        const rowDelta = -Math.round(deltaY / rowHeight);
        const nextRow = Math.max(0, Math.min(touchStartRowRef.current + rowDelta, maxFirstRow));
        setFirstRow(nextRow);
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
      touchStartRowRef.current = null;
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [maxFirstRow, rowHeight]);

  // 8. 스크롤바 드래그
  useEffect(() => {
    if (!scrollbarDragging) return;
    
    isDraggingRef.current = true;
    
    if (workerRef.current && file) {
      requestChunks(firstRow, workerRef.current, file, fileSize, visibleRows + 100);
    }
    
    let lastRenderTime = 0;
    const RENDER_INTERVAL = 150;
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
    const UPDATE_INTERVAL = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime < UPDATE_INTERVAL) return;
      
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      
      animationFrameId = requestAnimationFrame(() => {
        const deltaY = e.clientY - scrollbarStartY;
        const totalScrollable = canvasSize.height - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round((deltaY / totalScrollable) * (rowCount - visibleRows));
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));
        firstRowRef.current = nextRow;
        setFirstRow(nextRow);
        lastUpdateTime = currentTime;
        
        if (workerRef.current && file) {
          requestChunks(nextRow, workerRef.current, file, fileSize, visibleRows + 50);
        }
      });
    };

    const handleEnd = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (periodicRafId !== null) cancelAnimationFrame(periodicRafId);
      setScrollbarDragging(false);
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      
      setTimeout(() => {
        directRenderRef.current();
      }, 100);
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
  }, [scrollbarDragging, scrollbarStartY, scrollbarStartRow, rowCount, visibleRows, maxFirstRow, canvasSize.height, scrollbarHeight, file, fileSize, requestChunks]);

  // 9. 청크 요청 (debounce)
  useEffect(() => {
    if (!file || !workerRef.current || isDraggingRef.current) return;
    
    const timer = setTimeout(() => {
      requestChunks(firstRow, workerRef.current!, file, fileSize, visibleRows + 30);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [file, firstRow, visibleRows, fileSize, requestChunks]);

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
