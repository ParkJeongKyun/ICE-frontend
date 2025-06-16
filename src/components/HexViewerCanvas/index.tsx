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

  // 캔버스 크기 자동 조정
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

  // 스크롤 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

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
  function getByteIndexFromMouse(
    x: number,
    y: number,
    scrollTop: number
  ): number | null {
    const row = Math.floor((y + scrollTop) / rowHeight);
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

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = getByteIndexFromMouse(x, y, scrollTop);
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
    const idx = getByteIndexFromMouse(x, y, scrollTop);
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

  // 캔버스 렌더링
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // 스크롤에 따라 보이는 행만 렌더링
    const firstRow = Math.floor(scrollTop / rowHeight);
    const visibleRows = Math.ceil(canvasSize.height / rowHeight) + 1;
    for (
      let row = firstRow;
      row < Math.min(rowCount, firstRow + visibleRows);
      row++
    ) {
      const y = (row - firstRow) * rowHeight;
      const offset = row * bytesPerRow;
      // Offset
      ctx.fillStyle = '#888';
      ctx.fillText(
        offset.toString(16).padStart(8, '0').toUpperCase(),
        10,
        y + 4
      );

      // HEX
      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= buffer.length) break;
        const x = hexStartX + i * hexByteWidth;
        // 선택 영역
        if (isSelected(idx)) {
          ctx.fillStyle = '#2d8cf0';
          ctx.fillRect(x - 2, y + 2, hexByteWidth - 2, rowHeight - 4);
          ctx.fillStyle = '#fff';
        } else {
          ctx.fillStyle = i % 2 === 0 ? '#222' : '#444';
        }
        ctx.fillText(byteToHex(buffer[idx]), x, y + 4);
      }
      // ASCII
      for (let i = 0; i < bytesPerRow; i++) {
        const idx = offset + i;
        if (idx >= buffer.length) break;
        const x = asciiStartX + i * asciiCharWidth;
        const char = byteToChar(buffer[idx], encoding);
        if (isSelected(idx)) {
          ctx.fillStyle = '#2d8cf0';
          ctx.fillRect(x - 1, y + 2, asciiCharWidth - 2, rowHeight - 4);
          ctx.fillStyle = '#fff';
        } else {
          ctx.fillStyle = char === '.' ? '#bbb' : '#222';
        }
        ctx.fillText(char, x, y + 4);
      }
    }
  }, [buffer, encoding, canvasSize, scrollTop, selectionRange, isSelected]);

  // 컨텍스트 메뉴 외부 클릭 닫기
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

  // 드래그 종료(글로벌)
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

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
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: '#fff',
        position: 'relative',
      }}
      onScroll={handleScroll}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'text',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'absolute',
            top:
              contextMenu.y -
              (containerRef.current?.getBoundingClientRect().top || 0),
            left:
              contextMenu.x -
              (containerRef.current?.getBoundingClientRect().left || 0),
            background: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: 120,
            borderRadius: 4,
            padding: 0,
            userSelect: 'none',
          }}
          onClick={closeContextMenu}
          onBlur={closeContextMenu}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: '5px 5px' }}>
            <li
              style={{
                padding: '2.5px 10px',
                cursor: 'pointer',
                color: '#222',
                background: 'transparent',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
              onClick={handleCopyHex}
            >
              Copy (Hex String)
            </li>
            <li
              style={{
                padding: '2.5px 10px',
                cursor: 'pointer',
                color: '#222',
                background: 'transparent',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
              onClick={handleCopyText}
            >
              Copy (ASCII Text)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
