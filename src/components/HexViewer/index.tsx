import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
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
import { findPatternIndices, asciiToBytes } from '@/utils/byteSearch';

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

// 레이아웃 관련 상수(전체 패딩, 영역 간격 등)
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

// 모바일 레이아웃
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

// 각 영역 시작 위치 계산
const offsetStartX = containerPadding;
const hexStartX = offsetStartX + offsetWidth + gap;
const asciiStartX = hexStartX + bytesPerRow * hexByteWidth + gap;

// minHexWidth 계산도 변수 사용
const minHexWidth =
  containerPadding + // 좌측 패딩
  offsetWidth +
  gap +
  bytesPerRow * hexByteWidth +
  gap +
  bytesPerRow * asciiCharWidth +
  containerPadding; // 우측 패딩

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
  const {
    activeData,
    encoding,
    activeKey,
    scrollPositions,
    setScrollPositions,
  } = useTabData();
  
  const file = activeData?.file;
  const fileSize = file?.size || 0;
  const rowCount = Math.ceil(fileSize / bytesPerRow);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const { selectionRange, setSelectionRange } = useSelection();

  // Worker 참조
  const workerRef = useRef<Worker | null>(null);
  
  // Worker 및 캐시를 탭별로 관리
  const workerCacheRef = useRef<Map<string, {
    worker: Worker;
    cache: Map<number, Uint8Array>;
  }>>(new Map());
  
  // chunkCache를 state에서 ref로 변경 (렌더링 트리거용 카운터만 state로)
  const chunkCacheRef = useRef<Map<number, Uint8Array>>(new Map());
  const [cacheUpdateTrigger, setCacheUpdateTrigger] = useState(0);

  // 오프셋 기반 스크롤
  const [firstRow, setFirstRow] = useState(0);

  // 가상 스크롤바 관련
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);
  const isDraggingRef = useRef(false); // 드래그 상태 추적용 ref

  // 전체 row, 보이는 row
  const visibleRows = Math.floor(canvasSize.height / rowHeight);
  const maxFirstRow = Math.max(0, rowCount - visibleRows);

  // 스크롤바 thumb 크기/위치 계산
  const scrollbarAreaHeight = canvasSize.height;
  const scrollbarHeight = Math.max(
    30,
    (visibleRows / rowCount) * scrollbarAreaHeight
  );
  const maxScrollbarTop = scrollbarAreaHeight - scrollbarHeight;
  const scrollbarTop = Math.min(
    maxScrollbarTop,
    (firstRow / maxFirstRow) * maxScrollbarTop || 0
  );

  // 렌더링 관련 값 캐싱
  const selectionRangeRef = useRef(selectionRange);
  const encodingRef = useRef(encoding);
  const canvasSizeRef = useRef(canvasSize);

  useEffect(() => {
    selectionRangeRef.current = selectionRange;
  }, [selectionRange]);
  useEffect(() => {
    encodingRef.current = encoding;
  }, [encoding]);
  useEffect(() => {
    canvasSizeRef.current = canvasSize;
  }, [canvasSize]);

  // ResizeObserver로 캔버스 크기 자동 조정
  useEffect(() => {
    if (!containerRef.current) return;
    const dpr = getDevicePixelRatio();
    const observer = new window.ResizeObserver((entries) => {
      for (const entry of entries) {
        let width: number;
        if (isMobile) {
          width = minHexWidth * dpr;
        } else {
          width = Math.max(entry.contentRect.width, minHexWidth) * dpr;
        }
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
  }, [isMobile, minHexWidth]);

  // 오프스크린 캔버스 (더블 버퍼링용)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 렌더링 예약 ref
  const rafRef = useRef<number | null>(null);
  
  // 마지막 렌더링된 firstRow 추적
  const lastRenderedRowRef = useRef<number>(-1);
  
  // 스크롤바 드래그 종료 후 렌더링 딜레이
  const renderDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldRender, setShouldRender] = useState(true);
  const [renderTrigger, setRenderTrigger] = useState(0); // 렌더링 트리거 카운터
  
  // Worker 초기화 - 탭별로 Worker와 캐시 유지
  useEffect(() => {
    if (!file || !activeKey) return;
    
    // 현재 탭의 Worker와 캐시 가져오기 또는 생성
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
          // 드래그 중이 아닐 때만 렌더링 트리거
          if (!isDraggingRef.current) {
            setCacheUpdateTrigger(prev => prev + 1);
          }
        }
      };
      
      tabWorkerCache = { worker, cache };
      workerCacheRef.current.set(activeKey, tabWorkerCache);
    }
    
    // 현재 탭의 캐시로 ref 설정
    chunkCacheRef.current = tabWorkerCache.cache;
    workerRef.current = tabWorkerCache.worker;
    setCacheUpdateTrigger(prev => prev + 1);
    
    return () => {
      // 탭 전환 시에는 Worker 유지, 언마운트 시에만 정리
    };
  }, [file, activeKey]);
  
  // 컴포넌트 언마운트 시 모든 Worker 정리
  useEffect(() => {
    return () => {
      workerCacheRef.current.forEach(({ worker }) => {
        worker.terminate();
      });
      workerCacheRef.current.clear();
    };
  }, []);

  // 스크롤바 드래그 시 - 주기적 렌더링
  useEffect(() => {
    if (!scrollbarDragging) return;
    
    // 드래그 시작 시 즉시 렌더링 중단
    setShouldRender(false);
    
    // 드래그 시작 시 즉시 주변 청크 로드
    if (workerRef.current && file) {
      const CHUNK_SIZE = 256 * 1024;
      const startByte = firstRow * bytesPerRow;
      const endByte = Math.min(
        startByte + (visibleRows + 100) * bytesPerRow,
        fileSize
      );
      
      const startChunk = Math.floor(startByte / CHUNK_SIZE);
      const endChunk = Math.floor(endByte / CHUNK_SIZE);
      
      // 즉시 모든 청크 요청
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
    
    // RAF를 사용한 주기적 렌더링 (더 부드러움)
    let lastRenderTime = 0;
    const RENDER_INTERVAL = 100; // 100ms (오타 수정: 100000 → 100)
    let rafId: number | null = null;
    
    const periodicRender = (timestamp: number) => {
      if (!isDraggingRef.current) return;
      
      if (timestamp - lastRenderTime >= RENDER_INTERVAL) {
        setRenderTrigger(prev => prev + 1); // 렌더링 트리거
        lastRenderTime = timestamp;
      }
      
      rafId = requestAnimationFrame(periodicRender);
    };
    
    rafId = requestAnimationFrame(periodicRender);
    
    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      
      if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
        return;
      }
      
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        const deltaY = e.clientY - scrollbarStartY;
        const totalScrollable = canvasSize.height - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round(
          (deltaY / totalScrollable) * (rowCount - visibleRows)
        );
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));
        setFirstRow(nextRow);
        lastUpdateTime = currentTime;
      });
    };

    const handleMouseUp = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setScrollbarDragging(false);
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      
      // 드래그 종료 후 즉시 렌더링 + renderTrigger 초기화
      setRenderTrigger(0);
      setShouldRender(true);
    };

    const handleTouchEnd = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setScrollbarDragging(false);
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      
      // 드래그 종료 후 즉시 렌더링 + renderTrigger 초기화
      setRenderTrigger(0);
      setShouldRender(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
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
    firstRow,
    bytesPerRow,
    fileSize,
    file,
    // chunkCache 제거
  ]);

  // 필요한 청크 요청 - 초기 로딩 시 병렬 요청
  const chunkRequestTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!file || !workerRef.current) return;
    
    if (chunkRequestTimerRef.current) {
      clearTimeout(chunkRequestTimerRef.current);
    }
    
    if (isDraggingRef.current) return;
    
    const debounceTime = 50;
    
    chunkRequestTimerRef.current = setTimeout(() => {
      const CHUNK_SIZE = 256 * 1024;
      const startByte = firstRow * bytesPerRow;
      const preloadRows = 30;
      const endByte = Math.min(
        startByte + (visibleRows + preloadRows) * bytesPerRow,
        fileSize
      );
      
      const startChunk = Math.floor(startByte / CHUNK_SIZE);
      const endChunk = Math.floor(endByte / CHUNK_SIZE);
      
      // 필요한 청크 모두 병렬 요청 (Worker가 알아서 큐 처리)
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
      
      // 캐시 정리 로직
      const maxCacheSize = 60;
      if (chunkCacheRef.current.size > maxCacheSize) {
        const currentChunks = new Set();
        for (let i = startChunk - 10; i <= endChunk + 10; i++) {
          currentChunks.add(i * CHUNK_SIZE);
        }
        
        // 현재 탭의 캐시 업데이트
        const tabWorkerCache = workerCacheRef.current.get(activeKey!);
        if (tabWorkerCache) {
          const newCache = new Map<number, Uint8Array>();
          for (const [offset, data] of tabWorkerCache.cache) {
            if (currentChunks.has(offset)) {
              newCache.set(offset, data);
            }
          }
          let count = newCache.size;
          for (const [offset, data] of tabWorkerCache.cache) {
            if (count >= maxCacheSize) break;
            if (!currentChunks.has(offset)) {
              newCache.set(offset, data);
              count++;
            }
          }
          tabWorkerCache.cache = newCache;
          chunkCacheRef.current = newCache;
          setCacheUpdateTrigger(prev => prev + 1);
        }
      }
    }, debounceTime);
    
    return () => {
      if (chunkRequestTimerRef.current) {
        clearTimeout(chunkRequestTimerRef.current);
      }
    };
  }, [file, firstRow, visibleRows, fileSize, activeKey]); // chunkCache 제거

  // 바이트 가져오기 (캐시에서) - ref 사용
  const getByte = useCallback((index: number): number | null => {
    const CHUNK_SIZE = 256 * 1024;
    const chunkOffset = Math.floor(index / CHUNK_SIZE) * CHUNK_SIZE;
    const chunk = chunkCacheRef.current.get(chunkOffset);
    if (!chunk) return null;
    return chunk[index - chunkOffset];
  }, []); // 의존성 없음 - ref 사용

  // wheel 이벤트로 한 줄씩 위/아래로 이동
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      let nextRow = firstRow;
      if (e.deltaY > 0) nextRow = Math.min(firstRow + 1, maxFirstRow);
      else if (e.deltaY < 0) nextRow = Math.max(firstRow - 1, 0);
      if (nextRow !== firstRow) setFirstRow(nextRow);
    },
    [firstRow, maxFirstRow]
  );

  // 스크롤바 드래그
  const handleScrollbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setScrollbarDragging(true);
    isDraggingRef.current = true;
    setScrollbarStartY(e.clientY);
    setScrollbarStartRow(firstRow);
    document.body.style.userSelect = 'none';
  };
  // 모바일 터치 스크롤바 지원
  const handleScrollbarTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setScrollbarDragging(true);
      isDraggingRef.current = true;
      setScrollbarStartY(e.touches[0].clientY);
      setScrollbarStartRow(firstRow);
      document.body.style.userSelect = 'none';
    }
  };

  // 모바일 터치 스크롤 구현
  const touchStartYRef = useRef<number | null>(null);
  const touchStartRowRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartRowRef.current = firstRow;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      e.touches.length === 1 &&
      touchStartYRef.current !== null &&
      touchStartRowRef.current !== null
    ) {
      const deltaY = e.touches[0].clientY - touchStartYRef.current;
      const rowDelta = -Math.round(deltaY / rowHeight);
      let nextRow = touchStartRowRef.current + rowDelta;
      nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));
      setFirstRow(nextRow);
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    touchStartRowRef.current = null;
  };

  // 렌더링 함수 - chunkCache 의존성 제거
  const renderCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // 오프스크린 캔버스 초기화
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    
    const offscreenCanvas = offscreenCanvasRef.current;
    offscreenCanvas.width = canvasSize.width;
    offscreenCanvas.height = canvasSize.height;
    const offCtx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!offCtx) return;
    
    // CSS 변수에서 실제 색상값 읽기
    const style = getComputedStyle(document.documentElement);
    const COLOR_HEX_EVEN =
      style.getPropertyValue('--main-color_1').trim() || '#a0c0d8';
    const COLOR_HEX_ODD =
      style.getPropertyValue('--main-color').trim() || '#d8e8f0';
    const COLOR_ASCII =
      style.getPropertyValue('--main-color').trim() || '#d8e8f0';
    const COLOR_ASCII_DISABLED =
      style.getPropertyValue('--main-disabled-color').trim() || '#3a4754';
    const COLOR_SELECTED_BG =
      style.getPropertyValue('--main-hover-color').trim() || '#243240';
    const COLOR_SELECTED_TEXT =
      style.getPropertyValue('--ice-main-color').trim() || '#60c8ff';
    const COLOR_OFFSET =
      style.getPropertyValue('--ice-main-color_4').trim() || '#d8f0ff';
    const COLOR_BG =
      style.getPropertyValue('--main-bg-color').trim() || '#1a1f28';

    const dpr = getDevicePixelRatio();
    
    // 오프스크린 캔버스에 먼저 그리기
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.fillStyle = COLOR_BG;
    offCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    offCtx.save();
    offCtx.scale(dpr, 1);

    offCtx.font = font;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const renderRows = Math.ceil(canvasSize.height / rowHeight) + 1;
    
    for (
      let row = firstRow, drawRow = 0;
      row < Math.min(rowCount, firstRow + renderRows) &&
      drawRow * rowHeight < canvasSize.height;
      row++, drawRow++
    ) {
      const y = drawRow * rowHeight;
      const offset = row * bytesPerRow;

      // 오프셋(주소) 텍스트 선택 영역 포함 여부
      const offsetStart = row * bytesPerRow;
      const offsetEnd = Math.min(
        offsetStart + bytesPerRow - 1,
        fileSize - 1
      );
      const selStart = selectionRange.start;
      const selEnd = selectionRange.end;
      const isOffsetSel =
        selStart !== null &&
        selEnd !== null &&
        offsetStart <= Math.max(selStart, selEnd) &&
        offsetEnd >= Math.min(selStart, selEnd);

      // 오프셋(주소) 텍스트
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      if (isOffsetSel) {
        offCtx.fillStyle = COLOR_SELECTED_BG;
        offCtx.fillRect(
          offsetStartX,
          y + 2,
          offsetWidth,
          rowHeight - 4
        );
        offCtx.fillStyle = COLOR_SELECTED_TEXT;
      } else {
        offCtx.fillStyle = COLOR_OFFSET;
      }
      offCtx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        offsetStartX + offsetWidth / 2,
        y + rowHeight / 2
      );

      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= fileSize) break;
        
        const byte = getByte(idx);
        
        // 바이트가 없으면 로딩 표시 (회색)
        if (byte === null) {
          const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
          const yHex = y + rowHeight / 2;
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
        
        // HEX 렌더링
        const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
        const yHex = y + rowHeight / 2;
        const isSel =
          selectionRange.start !== null &&
          selectionRange.end !== null &&
          idx >= Math.min(selectionRange.start, selectionRange.end) &&
          idx <= Math.max(selectionRange.start, selectionRange.end);

        if (isSel) {
          offCtx.fillStyle = COLOR_SELECTED_BG;
          offCtx.fillRect(
            xHex - hexByteWidth / 2 + 1,
            y + 2,
            hexByteWidth - 2,
            rowHeight - 4
          );
          offCtx.fillStyle = COLOR_SELECTED_TEXT;
        } else {
          offCtx.fillStyle = i % 2 === 0 ? COLOR_HEX_EVEN : COLOR_HEX_ODD;
        }
        offCtx.fillText(byteToHex(byte), xHex, yHex);

        // ASCII 렌더링
        const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
        const yAsc = y + rowHeight / 2;
        const char = byteToChar(byte, encoding);
        if (isSel) {
          offCtx.fillStyle = COLOR_SELECTED_BG;
          offCtx.fillRect(
            xAsc - asciiCharWidth / 2 + 1,
            y + 2,
            asciiCharWidth - 2,
            rowHeight - 4
          );
          offCtx.fillStyle = COLOR_SELECTED_TEXT;
        } else {
          offCtx.fillStyle = char === '.' ? COLOR_ASCII_DISABLED : COLOR_ASCII;
        }
        offCtx.fillText(char, xAsc, yAsc);
      }
    }
    offCtx.restore();
    
    // 오프스크린 캔버스를 메인 캔버스에 복사
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
    
    lastRenderedRowRef.current = firstRow;
    
  }, [firstRow, rowCount, fileSize, encoding, canvasSize.width, canvasSize.height, selectionRange.start, selectionRange.end, getByte, renderTrigger]);

  // 통합된 렌더링 트리거 - 단일 useEffect로 처리
  useEffect(() => {
    // 드래그 중이고 shouldRender가 false면 renderTrigger 변경 시에만 렌더링
    if (isDraggingRef.current && !shouldRender) {
      if (renderTrigger === 0) return;
    }
    
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    rafRef.current = requestAnimationFrame(() => {
      renderCanvas();
      rafRef.current = null;
    });
    
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [renderCanvas, renderTrigger, shouldRender, cacheUpdateTrigger]);

  // cleanup
  useEffect(() => {
    return () => {
      if (renderDelayTimerRef.current) {
        clearTimeout(renderDelayTimerRef.current);
      }
    };
  }, []);

  // 검색 API 수정 (전체 파일 스캔)
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
        // if (hex.trim()) {
        //   try {
        //     const cleanHex = hex.replace(/\s+/g, '');
        //     if (cleanHex.length % 2 !== 0) return null;
        //     const pattern = new Uint8Array(
        //       cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
        //     );
        //     const indices = findPatternIndices(buffer, pattern);
        //     return indices.map((index) => ({ index, offset: pattern.length }));
        //   } catch (e) {
        //     console.log(e);
        //   }
        // }
        return null;
      },
      findAllByAsciiText: async (text: string, ignoreCase: boolean) => {
        // if (text.trim()) {
        //   try {
        //     const pattern = asciiToBytes(text);
        //     const indices = findPatternIndices(buffer, pattern, ignoreCase);
        //     return indices.map((index) => ({ index, offset: pattern.length }));
        //   } catch (e) {
        //     console.log(e);
        //   }
        // }
        return null;
      },
      scrollToIndex: (index: number, offset: number) => {
        const rowIndex = Math.floor(index / bytesPerRow);
        setFirstRow(rowIndex);
        setSelectionRange({
          start: index,
          end: index + offset - 1,
          arrayBuffer: null,
        });
      },
    }),
    [fileSize, setSelectionRange]
  );

  // firstRow를 탭별로 저장/복원
  useEffect(() => {
    if (activeKey && scrollPositions[activeKey] !== undefined) {
      setFirstRow(scrollPositions[activeKey]);
    } else {
      setFirstRow(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    if (activeKey) {
      setScrollPositions((prev) => ({
        ...prev,
        [activeKey]: firstRow,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRow, activeKey]);

  useEffect(() => {
    if (!contextMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  // 마우스 위치 → 바이트 인덱스 변환
  function getByteIndexFromMouse(x: number, y: number): number | null {
    const row = firstRow + Math.floor(y / rowHeight);
    if (row < 0 || row >= rowCount) return null;
    if (x >= hexStartX && x < hexStartX + bytesPerRow * hexByteWidth) {
      const col = Math.floor((x - hexStartX) / hexByteWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      if (idx >= fileSize) return null;
      return idx;
    }
    if (x >= asciiStartX && x < asciiStartX + bytesPerRow * asciiCharWidth) {
      const col = Math.floor((x - asciiStartX) / asciiCharWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      if (idx >= fileSize) return null;
      return idx;
    }
    return null;
  }

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = getByteIndexFromMouse(x, y);
    if (idx !== null) {
      setIsDragging(true);
      setSelectionRange({ ...selectionRange, start: idx, end: idx });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = getByteIndexFromMouse(x, y);
    if (idx !== null) {
      setSelectionRange((prev) => ({
        ...prev,
        end: idx,
      }));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // 컨텍스트 메뉴
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  // HEX 복사 - 대용량 선택 시 청크 단위로 처리
  const handleCopyHex = useCallback(async () => {
    if (
      selectionRange.start !== null &&
      selectionRange.end !== null &&
      file
    ) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const size = end - start;
      
      // 1MB 이상 선택 시 경고
      if (size > 1024 * 1024) {
        const confirm = window.confirm(
          `${(size / 1024 / 1024).toFixed(2)}MB의 데이터를 복사하시겠습니까? 시간이 오래 걸릴 수 있습니다.`
        );
        if (!confirm) {
          setContextMenu(null);
          return;
        }
      }
      
      try {
        const blob = file.slice(start, end);
        const arrayBuffer = await blob.arrayBuffer();
        const selected = new Uint8Array(arrayBuffer);
        
        // 청크 단위로 문자열 생성 (메모리 효율)
        const CHUNK_SIZE = 100000;
        let hex = '';
        for (let i = 0; i < selected.length; i += CHUNK_SIZE) {
          const chunk = selected.slice(i, Math.min(i + CHUNK_SIZE, selected.length));
          hex += Array.from(chunk)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' ') + ' ';
        }
        
        await navigator.clipboard.writeText(hex.trim());
      } catch (error) {
        console.error('HEX 문자열 복사 실패:', error);
        alert('복사 실패: ' + (error as Error).message);
      }
    }
    setContextMenu(null);
  }, [selectionRange, file]);

  // 텍스트 복사 - 대용량 선택 시 청크 단위로 처리
  const handleCopyText = useCallback(async () => {
    if (
      selectionRange.start !== null &&
      selectionRange.end !== null &&
      file
    ) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const size = end - start;
      
      // 1MB 이상 선택 시 경고
      if (size > 1024 * 1024) {
        const confirm = window.confirm(
          `${(size / 1024 / 1024).toFixed(2)}MB의 데이터를 복사하시겠습니까? 시간이 오래 걸릴 수 있습니다.`
        );
        if (!confirm) {
          setContextMenu(null);
          return;
        }
      }
      
      try {
        const blob = file.slice(start, end);
        const arrayBuffer = await blob.arrayBuffer();
        const selected = new Uint8Array(arrayBuffer);
        
        // 청크 단위로 문자열 생성 (메모리 효율)
        const CHUNK_SIZE = 100000;
        let text = '';
        for (let i = 0; i < selected.length; i += CHUNK_SIZE) {
          const chunk = selected.slice(i, Math.min(i + CHUNK_SIZE, selected.length));
          text += Array.from(chunk)
            .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
            .join('');
        }
        
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('텍스트 복사 실패:', error);
        alert('복사 실패: ' + (error as Error).message);
      }
    }
    setContextMenu(null);
  }, [selectionRange, file]);

  // 파일이 없으면 빈 화면
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
        <CanvasArea
          style={{
            minWidth: `${minHexWidth}px`,
          }}
        >
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
