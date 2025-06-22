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
  const buffer = activeData.buffer;
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

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
  const { start: startIndex, end: endIndex } = selectionRange;

  // 렌더링 관련 값 캐싱
  const selectionRangeRef = useRef(selectionRange);
  const bufferRef = useRef(buffer);
  const encodingRef = useRef(encoding);
  const canvasSizeRef = useRef(canvasSize);

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
    setScrollbarStartY(e.clientY);
    setScrollbarStartRow(firstRow);
    document.body.style.userSelect = 'none';
  };
  // 모바일 터치 스크롤바 지원
  const handleScrollbarTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setScrollbarDragging(true);
      setScrollbarStartY(e.touches[0].clientY);
      setScrollbarStartRow(firstRow);
      document.body.style.userSelect = 'none';
    }
  };

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
    // 모바일 터치 이동
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaY = e.touches[0].clientY - scrollbarStartY;
        const totalScrollable = canvasSize.height - scrollbarHeight;
        if (totalScrollable <= 0) return;
        const rowDelta = Math.round(
          (deltaY / totalScrollable) * (rowCount - visibleRows)
        );
        let nextRow = scrollbarStartRow + rowDelta;
        nextRow = Math.max(0, Math.min(nextRow, maxFirstRow));
        setFirstRow(nextRow);
      }
    };
    const handleTouchEnd = () => {
      setScrollbarDragging(false);
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
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
  ]);

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

  // 렌더링 함수
  const renderCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const buffer = bufferRef.current;
    const encoding = encodingRef.current;
    const canvasSize = canvasSizeRef.current;
    const selectionRange = selectionRangeRef.current;

    // CSS 변수에서 실제 색상값 읽기
    const style = getComputedStyle(document.documentElement);
    const COLOR_HEX_EVEN =
      style.getPropertyValue('--main-color_1').trim() || '#ababab';
    const COLOR_HEX_ODD =
      style.getPropertyValue('--main-color').trim() || '#cfcfcf';
    const COLOR_ASCII =
      style.getPropertyValue('--main-color').trim() || '#cfcfcf';
    const COLOR_ASCII_DISABLED =
      style.getPropertyValue('--main-disabled-color').trim() || '#505050';
    const COLOR_SELECTED_BG =
      style.getPropertyValue('--main-hover-color').trim() || '#494949';
    const COLOR_SELECTED_TEXT =
      style.getPropertyValue('--ice-main-color').trim() || 'rgb(156, 220, 254)';
    const COLOR_OFFSET =
      style.getPropertyValue('--ice-main-color_4').trim() || '#ffb86c';

    const dpr = getDevicePixelRatio();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.save();
    ctx.scale(dpr, 1);

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

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
        buffer.length - 1
      );
      const selStart = selectionRange.start;
      const selEnd = selectionRange.end;
      const isOffsetSel =
        selStart !== null &&
        selEnd !== null &&
        // 선택 영역이 이 줄 전체를 포함하거나, 일부라도 겹치면 true
        offsetStart <= Math.max(selStart, selEnd) &&
        offsetEnd >= Math.min(selStart, selEnd);

      // 오프셋(주소) 텍스트
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isOffsetSel) {
        ctx.fillStyle = COLOR_SELECTED_BG;
        ctx.fillRect(
          offsetStartX, // 좌측 패딩만큼 띄움
          y + 2,
          offsetWidth,
          rowHeight - 4
        );
        ctx.fillStyle = COLOR_SELECTED_TEXT;
      } else {
        ctx.fillStyle = COLOR_OFFSET;
      }
      ctx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        offsetStartX + offsetWidth / 2, // 중앙 위치도 패딩 반영
        y + rowHeight / 2
      );

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= buffer.length) break;

        // HEX
        const xHex = hexStartX + i * hexByteWidth + hexByteWidth / 2;
        const yHex = y + rowHeight / 2;
        const isSel =
          selectionRange.start !== null &&
          selectionRange.end !== null &&
          idx >= Math.min(selectionRange.start, selectionRange.end) &&
          idx <= Math.max(selectionRange.start, selectionRange.end);

        if (isSel) {
          ctx.fillStyle = COLOR_SELECTED_BG;
          ctx.fillRect(
            xHex - hexByteWidth / 2 + 1,
            y + 2,
            hexByteWidth - 2,
            rowHeight - 4
          );
          ctx.fillStyle = COLOR_SELECTED_TEXT;
        } else {
          ctx.fillStyle = i % 2 === 0 ? COLOR_HEX_EVEN : COLOR_HEX_ODD;
        }
        ctx.fillText(byteToHex(buffer[idx]), xHex, yHex);

        // ASCII
        const xAsc = asciiStartX + i * asciiCharWidth + asciiCharWidth / 2;
        const yAsc = y + rowHeight / 2;
        const char = byteToChar(buffer[idx], encoding);
        if (isSel) {
          ctx.fillStyle = COLOR_SELECTED_BG;
          ctx.fillRect(
            xAsc - asciiCharWidth / 2 + 1,
            y + 2,
            asciiCharWidth - 2,
            rowHeight - 4
          );
          ctx.fillStyle = COLOR_SELECTED_TEXT;
        } else {
          ctx.fillStyle = char === '.' ? COLOR_ASCII_DISABLED : COLOR_ASCII;
        }
        ctx.fillText(char, xAsc, yAsc);
      }
    }
    ctx.restore();
  }, [firstRow, rowCount]);

  // 렌더링 트리거
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

  // 마우스 위치 → 바이트 인덱스 변환
  function getByteIndexFromMouse(x: number, y: number): number | null {
    const row = firstRow + Math.floor(y / rowHeight);
    if (row < 0 || row >= rowCount) return null;
    if (x >= hexStartX && x < hexStartX + bytesPerRow * hexByteWidth) {
      const col = Math.floor((x - hexStartX) / hexByteWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      if (idx >= buffer.length) return null;
      return idx;
    }
    if (x >= asciiStartX && x < asciiStartX + bytesPerRow * asciiCharWidth) {
      const col = Math.floor((x - asciiStartX) / asciiCharWidth);
      if (col < 0 || col >= bytesPerRow) return null;
      const idx = row * bytesPerRow + col;
      if (idx >= buffer.length) return null;
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

  // 검색/스크롤 API
  useImperativeHandle(
    ref,
    () => ({
      findByOffset: async (offset: string) => {
        if (offset.trim()) {
          const byteOffset = parseInt(offset, 16);
          if (
            !isNaN(byteOffset) &&
            byteOffset >= 0 &&
            byteOffset < buffer.length
          ) {
            return { index: byteOffset, offset: 1 };
          }
        }
        return null;
      },
      findAllByHex: async (hex: string) => {
        if (hex.trim()) {
          try {
            const cleanHex = hex.replace(/\s+/g, '');
            if (cleanHex.length % 2 !== 0) return null;
            const pattern = new Uint8Array(
              cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
            );
            const indices = findPatternIndices(buffer, pattern);
            return indices.map((index) => ({ index, offset: pattern.length }));
          } catch (e) {
            console.log(e);
          }
        }
        return null;
      },
      findAllByAsciiText: async (text: string, ignoreCase: boolean) => {
        if (text.trim()) {
          try {
            const pattern = asciiToBytes(text);
            const indices = findPatternIndices(buffer, pattern, ignoreCase);
            return indices.map((index) => ({ index, offset: pattern.length }));
          } catch (e) {
            console.log(e);
          }
        }
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
    [buffer, setSelectionRange]
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

  return (
    <CanvasContainer
      ref={containerRef}
      onWheel={handleWheel}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        {rowCount > visibleRows && (
          <VirtualScrollbar style={{ height: '100%', alignSelf: 'stretch' }}>
            <ScrollbarThumb
              ref={scrollbarRef}
              dragging={scrollbarDragging.toString()}
              height={scrollbarHeight}
              top={scrollbarTop}
              onMouseDown={handleScrollbarMouseDown}
              onTouchStart={handleScrollbarTouchStart}
            />
          </VirtualScrollbar>
        )}
      </CanvasArea>
      {/* 스크롤바를 CanvasArea 내부로 이동 */}
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
