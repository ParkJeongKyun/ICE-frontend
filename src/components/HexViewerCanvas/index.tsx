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
  CanvasContainer,
  CanvasArea,
  StyledCanvas,
  VirtualScrollbar,
  ScrollbarThumb,
  ContextMenu,
  ContextMenuList,
  ContextMenuItem,
} from './index.styles';

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

const bytesPerRow = 16;
const rowHeight = 22;
const font = '14px monospace';
const offsetWidth = 80;
const hexStartX = offsetWidth + 10;
const hexByteWidth = 26;
const asciiStartX = hexStartX + bytesPerRow * hexByteWidth + 20;
const asciiCharWidth = 12;

// 푸터 높이(px) - 실제 푸터 높이에 맞게 조정
// const footerHeight = 48;

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

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  const { activeData, encoding } = useTabData();
  const buffer = activeData.buffer;
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [scrollTop, setScrollTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const { selectionRange, setSelectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;

  // 렌더링 관련 값 캐싱
  const scrollTopRef = useRef(scrollTop);
  const selectionRangeRef = useRef(selectionRange);
  const bufferRef = useRef(buffer);
  const encodingRef = useRef(encoding);
  const canvasSizeRef = useRef(canvasSize);

  useEffect(() => {
    scrollTopRef.current = scrollTop;
  }, [scrollTop]);
  useEffect(() => {
    selectionRangeRef.current = selectionRange;
  }, [selectionRange]);
  useEffect(() => {
    bufferRef.current = buffer;
  }, [buffer]);
  useEffect(() => {
    encodingRef.current = encoding;
  }, [encoding]);
  useEffect(() => {
    canvasSizeRef.current = canvasSize;
  }, [canvasSize]);

  // 캔버스 크기 자동 조정 (항상 보이는 영역만큼만)
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 렌더링 예약 ref
  const rafRef = useRef<number | null>(null);

  // 오프셋 기반 스크롤: 실제 스크롤 대신 데이터만 변경
  const [firstRow, setFirstRow] = useState(0);

  // 가상 스크롤바 관련
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [scrollbarDragging, setScrollbarDragging] = useState(false);
  const [scrollbarStartY, setScrollbarStartY] = useState(0);
  const [scrollbarStartRow, setScrollbarStartRow] = useState(0);

  // 전체 row, 보이는 row (100% height 기준)
  const visibleRows = Math.ceil(canvasSize.height / rowHeight);
  const maxFirstRow = Math.max(0, rowCount - visibleRows);

  // 스크롤바 thumb 크기/위치 계산 (100% height 기준)
  // 수정: thumb가 영역을 벗어나지 않도록 top 계산을 max 값으로 제한
  const scrollbarAreaHeight = canvasSize.height;
  const scrollbarHeight = Math.max(
    30,
    (visibleRows / rowCount) * scrollbarAreaHeight
  );
  // thumb가 영역을 벗어나지 않게 보정
  const maxScrollbarTop = scrollbarAreaHeight - scrollbarHeight;
  const scrollbarTop = Math.min(
    maxScrollbarTop,
    (firstRow / maxFirstRow) * maxScrollbarTop || 0
  );

  // wheel 이벤트로 한 줄씩 위/아래로 이동
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      let nextRow = firstRow;
      if (e.deltaY > 0) {
        // 아래로
        nextRow = Math.min(firstRow + 1, maxFirstRow);
      } else if (e.deltaY < 0) {
        // 위로
        nextRow = Math.max(firstRow - 1, 0);
      }
      if (nextRow !== firstRow) setFirstRow(nextRow);
    },
    [firstRow, maxFirstRow]
  );

  // 스크롤바 드래그 시작
  const handleScrollbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setScrollbarDragging(true);
    setScrollbarStartY(e.clientY);
    setScrollbarStartRow(firstRow);
    document.body.style.userSelect = 'none';
  };

  // 스크롤바 드래그 중
  useEffect(() => {
    if (!scrollbarDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - scrollbarStartY;
      const totalScrollable = canvasSize.height - scrollbarHeight;
      if (totalScrollable <= 0) return;
      const rowDelta = Math.round(
        (deltaY / totalScrollable) * (rowCount - visibleRows)
      );
      let nextRow = scrollbarStartRow + rowDelta;
      nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));
      setFirstRow(nextRow);
    };
    const handleMouseUp = () => {
      setScrollbarDragging(false);
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
  ]);

  // 렌더링 함수: firstRow 기준으로 데이터만 변경
  const renderCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const buffer = bufferRef.current;
    const encoding = encodingRef.current;
    const canvasSize = canvasSizeRef.current;
    const selectionRange = selectionRangeRef.current;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';

    const visibleRows = Math.ceil(canvasSize.height / rowHeight) + 1;
    for (
      let row = firstRow, drawRow = 0;
      row < Math.min(rowCount, firstRow + visibleRows);
      row++, drawRow++
    ) {
      const y = drawRow * rowHeight;
      const offset = row * bytesPerRow;

      // Offset
      ctx.fillStyle = '#888';
      ctx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        10,
        y + 4
      );

      // HEX/ASCII 변환 및 그리기
      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= buffer.length) break;

        // HEX
        const xHex = hexStartX + i * hexByteWidth;
        const isSel =
          selectionRange.start !== null &&
          selectionRange.end !== null &&
          idx >= Math.min(selectionRange.start, selectionRange.end) &&
          idx <= Math.max(selectionRange.start, selectionRange.end);

        if (isSel) {
          ctx.fillStyle = '#2d8cf0';
          ctx.fillRect(xHex - 2, y + 2, hexByteWidth - 2, rowHeight - 4);
          ctx.fillStyle = '#fff';
        } else {
          ctx.fillStyle = i % 2 === 0 ? '#222' : '#444';
        }
        ctx.fillText(byteToHex(buffer[idx]), xHex, y + 4);

        // ASCII
        const xAsc = asciiStartX + i * asciiCharWidth;
        const char = byteToChar(buffer[idx], encoding);
        if (isSel) {
          ctx.fillStyle = '#2d8cf0';
          ctx.fillRect(xAsc - 1, y + 2, asciiCharWidth - 2, rowHeight - 4);
          ctx.fillStyle = '#fff';
        } else {
          ctx.fillStyle = char === '.' ? '#bbb' : '#222';
        }
        ctx.fillText(char, xAsc, y + 4);
      }
    }
    ctx.restore();
  }, [firstRow, rowCount]);

  // 렌더링 트리거 (firstRow, buffer 등 변경 시)
  useEffect(() => {
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
  }, [renderCanvas, buffer, encoding, canvasSize, selectionRange, firstRow]);

  // 선택 영역 계산
  const isSelected = useCallback(
    (byteIndex: number) =>
      startIndex !== null &&
      endIndex !== null &&
      byteIndex >= Math.min(startIndex, endIndex) &&
      byteIndex <= Math.max(startIndex, endIndex),
    [startIndex, endIndex]
  );

  // 마우스 위치 → 바이트 인덱스 변환 (firstRow 기준으로 y좌표 변환)
  function getByteIndexFromMouse(x: number, y: number): number | null {
    const row = firstRow + Math.floor(y / rowHeight);
    if (row < 0 || row >= rowCount) return null;
    // HEX 영역
    if (x >= hexStartX && x < hexStartX + bytesPerRow * hexByteWidth) {
      const col = Math.floor((x - hexStartX) / hexByteWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      if (idx >= buffer.length) return null;
      return idx;
    }
    // ASCII 영역
    if (x >= asciiStartX && x < asciiStartX + bytesPerRow * asciiCharWidth) {
      const col = Math.floor((x - asciiStartX) / asciiCharWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      if (idx >= buffer.length) return null;
      return idx;
    }
    return null;
  }

  // 마우스 이벤트 핸들러 (firstRow 기반)
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

  // HEX 복사
  const handleCopyHex = useCallback(async () => {
    if (
      selectionRange.start !== null &&
      selectionRange.end !== null &&
      buffer &&
      buffer.length > 0
    ) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const selected = buffer.slice(start, end);
      try {
        const hex = Array.from(selected)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
        await navigator.clipboard.writeText(hex);
      } catch {
        console.error('HEX 문자열 복사 실패');
      }
    }
    setContextMenu(null);
  }, [selectionRange, buffer]);

  // 텍스트 복사
  const handleCopyText = useCallback(async () => {
    if (
      selectionRange.start !== null &&
      selectionRange.end !== null &&
      buffer &&
      buffer.length > 0
    ) {
      const start = Math.min(selectionRange.start, selectionRange.end);
      const end = Math.max(selectionRange.start, selectionRange.end) + 1;
      const selected = buffer.slice(start, end);
      try {
        const text = Array.from(selected)
          .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
          .join('');
        await navigator.clipboard.writeText(text);
      } catch {
        console.error('텍스트 복사 실패');
      }
    }
    setContextMenu(null);
  }, [selectionRange, buffer]);

  // 검색/스크롤 API (기존과 동일)
  useImperativeHandle(
    ref,
    () => ({
      findByOffset: async (offset: string) => {
        if (offset.trim()) {
          const byteOffset = parseInt(offset, 16);
          if (byteOffset >= 0 && byteOffset < buffer.length) {
            return { index: byteOffset, offset: bytesPerRow };
          }
        }
        return null;
      },
      findAllByHex: async (hex: string) => {
        if (hex.trim()) {
          try {
            const pattern = new Uint8Array(
              hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
            );
            // ...findPatternIndices 사용...
            return null;
          } catch (e) {
            console.log(e);
          }
        }
        return null;
      },
      findAllByAsciiText: async (text: string, ignoreCase: boolean) => {
        if (text.trim()) {
          try {
            // ...asciiToBytes, findPatternIndices 사용...
            return null;
          } catch (e) {
            console.log(e);
          }
        }
        return null;
      },
      scrollToIndex: (index: number, offset: number) => {
        const rowIndex = Math.floor(index / bytesPerRow);
        if (containerRef.current) {
          containerRef.current.scrollTop = rowIndex * rowHeight;
        }
        setSelectionRange({
          start: index,
          end: index + offset - 1,
          arrayBuffer: null,
        });
      },
    }),
    [buffer, setSelectionRange]
  );

  return (
    <CanvasContainer ref={containerRef} onWheel={handleWheel} tabIndex={0}>
      <CanvasArea>
        <StyledCanvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        />
      </CanvasArea>
      {/* 스크롤바 flex row로 우측에 고정, 100% height */}
      {rowCount > visibleRows && (
        <VirtualScrollbar style={{ height: '100%', alignSelf: 'stretch' }}>
          <ScrollbarThumb
            ref={scrollbarRef}
            dragging={scrollbarDragging}
            height={scrollbarHeight}
            top={scrollbarTop}
            onMouseDown={handleScrollbarMouseDown}
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
    </CanvasContainer>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
