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

// 레이아웃 상수
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

// 헬퍼 함수들
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

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  const { activeData, encoding, activeKey, scrollPositions, setScrollPositions } = useTabData();
  const { selectionRange, setSelectionRange } = useSelection();
  
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  // Canvas 및 Container refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  // Worker 및 캐시 관리 (탭별)
  const workerCacheRef = useRef<Map<string, {
    worker: Worker;
    cache: Map<number, Uint8Array>;
  }>>(new Map());
  const chunkCacheRef = useRef<Map<number, Uint8Array>>(new Map());
  const workerRef = useRef<Worker | null>(null);

  // 스크롤 상태
  const [firstRow, setFirstRow] = useState(0);
  const firstRowRef = useRef(0);

  // UI 상태
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);

  // 렌더링 최적화 refs
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const selectionRangeRef = useRef(selectionRange);
  const encodingRef = useRef(encoding);
  const canvasSizeRef = useRef(canvasSize);
  const hasValidDataRef = useRef(false); // 유효한 데이터 존재 여부

  // 터치 스크롤
  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  // 계산된 값
  const visibleRows = Math.floor(canvasSize.height / rowHeight);
  const maxFirstRow = Math.max(0, rowCount - visibleRows);
  const scrollbarAreaHeight = canvasSize.height;
  const scrollbarHeight = Math.max(30, (visibleRows / rowCount) * scrollbarAreaHeight);
  const maxScrollbarTop = scrollbarAreaHeight - scrollbarHeight;
  const scrollbarTop = Math.min(maxScrollbarTop, (firstRow / maxFirstRow) * maxScrollbarTop || 0);

  // Ref 동기화
  useEffect(() => { selectionRangeRef.current = selectionRange; }, [selectionRange]);
  useEffect(() => { encodingRef.current = encoding; }, [encoding]);
  useEffect(() => { canvasSizeRef.current = canvasSize; }, [canvasSize]);

  // ResizeObserver로 캔버스 크기 자동 조정
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

  // Worker 초기화 (탭별 캐시 유지)
  useEffect(() => {
    if (!file || !activeKey) return;
    
    let tabWorkerCache = workerCacheRef.current.get(activeKey);
    
    if (!tabWorkerCache) {
      const worker = new Worker(
        new URL('../../workers/fileReader.worker.ts', import.meta.url)
      );
      
      const cache = new Map<number, Uint8Array>();
      
      worker.onmessage = (e) => {
        const { type, offset, data } = e.data;
        if (type === 'CHUNK_DATA') {
          cache.set(offset, data);
          chunkCacheRef.current = cache;
          // 드래그 중이 아닐 때만 렌더링
          if (!isDraggingRef.current) {
            directRenderRef.current(); // ref로 직접 호출
          }
        }
      };
      
      tabWorkerCache = { worker, cache };
      workerCacheRef.current.set(activeKey, tabWorkerCache);
    }
    
    chunkCacheRef.current = tabWorkerCache.cache;
    workerRef.current = tabWorkerCache.worker;
    directRenderRef.current(); // ref로 직접 호출
  }, [file, activeKey]);

  // Worker 정리
  useEffect(() => {
    return () => {
      workerCacheRef.current.forEach(({ worker }) => worker.terminate());
      workerCacheRef.current.clear();
    };
  }, []);

  // 바이트 조회 (캐시 기반)
  const getByte = useCallback((index: number): number | null => {
    const CHUNK_SIZE = 256 * 1024;
    const chunkOffset = Math.floor(index / CHUNK_SIZE) * CHUNK_SIZE;
    const chunk = chunkCacheRef.current.get(chunkOffset);
    if (!chunk) return null;
    return chunk[index - chunkOffset];
  }, []);

  // 직접 렌더링 (state 의존성 없음, ref만 사용)
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
    
    // CSS 변수에서 색상 가져오기
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
    
    // 유효한 데이터 카운트 (빈 화면 방지)
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

      // 오프셋 렌더링
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

      // HEX 및 ASCII 렌더링
      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= fileSize) break;
        
        const byte = getByte(idx);
        
        // 로딩 중 표시
        if (byte === null) {
          const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
          offCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
          offCtx.fillRect(xHex - hexByteWidth / 2 + 1, y + 2, hexByteWidth - 2, rowHeight - 4);
          
          const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
          offCtx.fillRect(xAsc - asciiCharWidth / 2 + 1, y + 2, asciiCharWidth - 2, rowHeight - 4);
          continue;
        }
        
        validByteCount++; // 유효한 바이트 카운트
        
        const isSel =
          selStart !== null &&
          selEnd !== null &&
          idx >= Math.min(selStart, selEnd) &&
          idx <= Math.max(selStart, selEnd);

        // HEX
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

        // ASCII
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
    
    // 유효한 데이터가 일정 이상 있을 때만 화면 업데이트 (드래그 중 빈 화면 방지)
    const hasEnoughData = validByteCount > (renderRows * bytesPerRow * 0.3); // 30% 이상
    if (hasEnoughData || !isDraggingRef.current || !hasValidDataRef.current) {
      // 오프스크린 → 메인 캔버스 복사
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, currentCanvasSize.width, currentCanvasSize.height);
      ctx.drawImage(offscreenCanvas, 0, 0);
      
      if (validByteCount > 0) {
        hasValidDataRef.current = true;
      }
    }
    // 유효한 데이터가 부족하면 이전 화면 유지 (빈 화면 방지)
    
  }, [fileSize, rowCount, getByte]);

  // directRender ref 저장
  const directRenderRef = useRef(directRender);
  useEffect(() => {
    directRenderRef.current = directRender;
  }, [directRender]);

  // RAF 스케줄러 (중복 방지) - directRender 의존성 제거
  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      directRenderRef.current(); // ref로 호출
      rafRef.current = null;
    });
  }, []); // 빈 의존성 배열

  // firstRow 변경 시 ref 업데이트 + 렌더링
  useEffect(() => {
    firstRowRef.current = firstRow;
    if (!isDraggingRef.current) {
      scheduleRender();
    }
  }, [firstRow, scheduleRender]);

  // 선택 영역 변경 시 렌더링
  useEffect(() => {
    if (!isDraggingRef.current) {
      scheduleRender();
    }
  }, [selectionRange.start, selectionRange.end, scheduleRender]);

  // 캔버스 크기, 인코딩 변경 시 렌더링
  useEffect(() => {
    scheduleRender();
  }, [canvasSize.width, canvasSize.height, encoding, scheduleRender]);

  // Worker 초기화 (탭별 캐시 유지)
  useEffect(() => {
    if (!file || !activeKey) return;
    
    let tabWorkerCache = workerCacheRef.current.get(activeKey);
    
    if (!tabWorkerCache) {
      const worker = new Worker(
        new URL('../../workers/fileReader.worker.ts', import.meta.url)
      );
      
      const cache = new Map<number, Uint8Array>();
      
      worker.onmessage = (e) => {
        const { type, offset, data } = e.data;
        if (type === 'CHUNK_DATA') {
          cache.set(offset, data);
          chunkCacheRef.current = cache;
          // 드래그 중이 아닐 때만 렌더링
          if (!isDraggingRef.current) {
            directRenderRef.current(); // ref로 직접 호출
          }
        }
      };
      
      tabWorkerCache = { worker, cache };
      workerCacheRef.current.set(activeKey, tabWorkerCache);
    }
    
    chunkCacheRef.current = tabWorkerCache.cache;
    workerRef.current = tabWorkerCache.worker;
    directRenderRef.current(); // ref로 직접 호출
  }, [file, activeKey]);

  // 스크롤바 드래그 처리
  useEffect(() => {
    if (!scrollbarDragging) return;
    
    isDraggingRef.current = true;
    
    // 드래그 시작 시 주변 청크 미리 로드 (범위 확대)
    if (workerRef.current && file) {
      const CHUNK_SIZE = 256 * 1024;
      const startByte = firstRow * bytesPerRow;
      const endByte = Math.min(startByte + (visibleRows + 200) * bytesPerRow, fileSize); // 100 → 200
      const startChunk = Math.floor(startByte / CHUNK_SIZE);
      const endChunk = Math.floor(endByte / CHUNK_SIZE);
      
      for (let i = startChunk; i <= endChunk; i++) {
        const offset = i * CHUNK_SIZE;
        if (!chunkCacheRef.current.has(offset)) {
          workerRef.current.postMessage({
            type: 'READ_CHUNK',
            file,
            offset,
            length: Math.min(CHUNK_SIZE, fileSize - offset),
          });
        }
      }
    }
    
    // 주기적 렌더링 (200ms 간격으로 증가)
    let lastRenderTime = 0;
    const RENDER_INTERVAL = 200; // 100ms → 200ms (청크 로딩 시간 확보)
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
    
    // 마우스 이동 처리 (50ms throttle)
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
        
        // 마우스 이동 시 해당 영역 청크 즉시 요청
        if (workerRef.current && file) {
          const CHUNK_SIZE = 256 * 1024;
          const startByte = nextRow * bytesPerRow;
          const endByte = Math.min(startByte + (visibleRows + 50) * bytesPerRow, fileSize);
          const startChunk = Math.floor(startByte / CHUNK_SIZE);
          const endChunk = Math.floor(endByte / CHUNK_SIZE);
          
          for (let i = startChunk; i <= endChunk; i++) {
            const offset = i * CHUNK_SIZE;
            if (!chunkCacheRef.current.has(offset)) {
              workerRef.current.postMessage({
                type: 'READ_CHUNK',
                file,
                offset,
                length: Math.min(CHUNK_SIZE, fileSize - offset),
              });
            }
          }
        }
      });
    };

    const handleEnd = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (periodicRafId !== null) cancelAnimationFrame(periodicRafId);
      setScrollbarDragging(false);
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      
      // 드래그 종료 후 약간 지연 후 최종 렌더링 (청크 로딩 대기)
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
  }, [scrollbarDragging, scrollbarStartY, scrollbarStartRow, rowCount, visibleRows, maxFirstRow, canvasSize.height, scrollbarHeight, firstRow, bytesPerRow, fileSize, file]);

  // 청크 요청 (debounce 50ms)
  useEffect(() => {
    if (!file || !workerRef.current || isDraggingRef.current) return;
    
    const timer = setTimeout(() => {
      const CHUNK_SIZE = 256 * 1024;
      const startByte = firstRow * bytesPerRow;
      const endByte = Math.min(startByte + (visibleRows + 30) * bytesPerRow, fileSize);
      const startChunk = Math.floor(startByte / CHUNK_SIZE);
      const endChunk = Math.floor(endByte / CHUNK_SIZE);
      
      for (let i = startChunk; i <= endChunk; i++) {
        const offset = i * CHUNK_SIZE;
        if (!chunkCacheRef.current.has(offset)) {
          workerRef.current?.postMessage({
            type: 'READ_CHUNK',
            file,
            offset,
            length: Math.min(CHUNK_SIZE, fileSize - offset),
          });
        }
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [file, firstRow, visibleRows, fileSize]);

  // 이벤트 핸들러
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const nextRow = e.deltaY > 0
        ? Math.min(firstRow + 1, maxFirstRow)
        : Math.max(firstRow - 1, 0);
      if (nextRow !== firstRow) setFirstRow(nextRow);
    },
    [firstRow, maxFirstRow]
  );

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

  // 복사 기능
  const handleCopyHex = useCallback(async () => {
    if (selectionRange.start !== null && selectionRange.end !== null && file) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const size = end - start;
      
      if (size > 1024 * 1024) {
        const confirm = window.confirm(
          `${(size / 1024 / 1024).toFixed(2)}MB의 데이터를 복사하시겠습니까?`
        );
        if (!confirm) {
          setContextMenu(null);
          return;
        }
      }
      
      try {
        const arrayBuffer = await file.slice(start, end).arrayBuffer();
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
      
      if (size > 1024 * 1024) {
        const confirm = window.confirm(
          `${(size / 1024 / 1024).toFixed(2)}MB의 데이터를 복사하시겠습니까?`
        );
        if (!confirm) {
          setContextMenu(null);
          return;
        }
      }
      
      try {
        const arrayBuffer = await file.slice(start, end).arrayBuffer();
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

  // 검색 API
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

  // 스크롤 위치 저장/복원
  useEffect(() => {
    if (activeKey && scrollPositions[activeKey] !== undefined) {
      setFirstRow(scrollPositions[activeKey]);
    } else {
      setFirstRow(0);
    }
  }, [activeKey, scrollPositions]);

  useEffect(() => {
    if (activeKey) {
      setScrollPositions((prev) => ({ ...prev, [activeKey]: firstRow }));
    }
  }, [firstRow, activeKey, setScrollPositions]);

  // 컨텍스트 메뉴 외부 클릭
  useEffect(() => {
    if (!contextMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  if (!file) {
    return (
      <HexViewerContainer>
        <CanvasContainer ref={containerRef} tabIndex={0}>
          <CanvasArea style={{ minWidth: `${minHexWidth}px` }}>
            <div style={{ padding: '20px', color: 'var(--main-color)' }}>
              No file loaded
            </div>
          </CanvasArea>
        </CanvasContainer>
      </HexViewerContainer>
    );
  }

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
