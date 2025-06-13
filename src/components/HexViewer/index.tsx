import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { GridCellProps } from 'react-virtualized';
import {
  HexByte,
  HexCell,
  GridDiv,
  OffsetByte,
  OffsetCell,
  TextByte,
  TextCell,
  ContextMenu,
  ContextMenuList,
  ContextMenuItem,
} from './index.styles';
import { asciiToBytes, findPatternIndices } from '@/utils/byteSearch';
import { useSelection } from '@/contexts/SelectionContext';
import { useTabData } from '@/contexts/TabDataContext';

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

const byteToHex = (byte: number): string => {
  return ('0' + byte.toString(16)).slice(-2).toUpperCase();
};

const encodingOptions = [
  { value: 'windows-1252', label: 'Windows-1252' },
  { value: 'ascii', label: 'ASCII' },
  { value: 'utf-8', label: 'UTF-8' },
];

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef> = (_, ref) => {
  const { activeData, encoding, setEncoding } = useTabData();
  const [scrollIndex, setScrollIndex] = React.useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const { selectionRange, setSelectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const bytesPerRow = 16;
  const rowHeight = 30;
  const columnCount = 3;
  const buffer = activeData.buffer;
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, byteIndex: number) => {
      if (event.button === 0) {
        setIsDragging(true);
        setSelectionRange((prev) => ({
          ...prev,
          start: byteIndex,
          end: byteIndex,
        }));
      }
    },
    [setSelectionRange]
  );

  const handleMouseMove = useCallback(
    (_: React.MouseEvent, byteIndex: number) => {
      if (isDragging) {
        setSelectionRange((prev) => {
          let start: number | null;
          let end: number | null;
          if (Number(prev.start) >= byteIndex) {
            start = byteIndex;
            end = prev.end;
          } else {
            start = prev.start;
            end = byteIndex;
          }
          return {
            ...prev,
            start: start,
            end: end,
          };
        });
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!isDragging) {
        setContextMenu({ x: event.clientX, y: event.clientY });
      }
    },
    [isDragging]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const getColumnWidth = ({ index }: { index: number }): number => {
    const widths = [95, 370, 175];
    return widths[index];
  };

  const getRowData = useCallback(
    (index: number) => {
      const start = index * bytesPerRow;
      const end = Math.min(start + bytesPerRow, buffer.length);
      const bytes = buffer.slice(start, end);
      const offset = start.toString(16).padStart(8, '0').toUpperCase();
      return { offset, bytes, start };
    },
    [buffer]
  );

  const isSelected = useCallback(
    (byteIndex: number) => {
      return (
        startIndex !== null &&
        endIndex !== null &&
        byteIndex >= Math.min(startIndex, endIndex) &&
        byteIndex <= Math.max(startIndex, endIndex)
      );
    },
    [startIndex, endIndex]
  );

  const renderHexByte = (
    byte: number,
    i: number,
    start: number
  ): JSX.Element => {
    const byteIndex = start + i;
    const selected = isSelected(byteIndex);

    return (
      <HexByte
        key={i}
        $isEven={i % 2 === 0}
        $selected={selected}
        onMouseDown={(e) => handleMouseDown(e, byteIndex)}
        onMouseEnter={(e) => handleMouseMove(e, byteIndex)}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {byteToHex(byte)}
      </HexByte>
    );
  };

  const renderTextByte = useCallback(
    (byte: number, i: number, start: number): JSX.Element => {
      const byteIndex = start + i;
      const selected = isSelected(byteIndex);
      const str = byteToChar(byte);

      return (
        <TextByte
          key={i}
          $isDot={str === '.'}
          $selected={selected}
          onMouseDown={(e) => handleMouseDown(e, byteIndex)}
          onMouseEnter={(e) => handleMouseMove(e, byteIndex)}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          {str}
        </TextByte>
      );
    },
    [
      isSelected,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleContextMenu,
      encoding,
    ]
  );

  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }: GridCellProps) => {
      const { offset, bytes, start } = getRowData(rowIndex);

      if (columnIndex === 0) {
        return (
          <OffsetCell key={key} style={style}>
            <OffsetByte $selected={isSelected(start)}>{offset}</OffsetByte>
          </OffsetCell>
        );
      } else if (columnIndex === 1) {
        const cells: JSX.Element[] = [];
        bytes.forEach((byte, i) => {
          cells.push(renderHexByte(byte, i, start));
        });

        return (
          <HexCell key={key} style={style}>
            {cells}
          </HexCell>
        );
      } else {
        const cells: JSX.Element[] = [];
        bytes.forEach((byte, i) => {
          cells.push(renderTextByte(byte, i, start));
        });

        return (
          <TextCell key={key} style={style}>
            {cells}
          </TextCell>
        );
      }
    },
    [getRowData, isSelected, renderHexByte, renderTextByte]
  );

  useImperativeHandle(
    ref,
    () => ({
      findByOffset: async (offset: string): Promise<IndexInfo | null> => {
        if (offset.trim()) {
          const byteOffset = parseInt(offset, 16);
          if (byteOffset >= 0 && byteOffset < buffer.length) {
            return {
              index: byteOffset,
              offset: bytesPerRow,
            };
          }
        }
        return null;
      },

      findAllByHex: async (hex: string): Promise<IndexInfo[] | null> => {
        if (hex.trim()) {
          try {
            const pattern = new Uint8Array(
              hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
            );
            const result = findPatternIndices(buffer, pattern).map((item) => ({
              index: item,
              offset: pattern.length,
            }));

            if (result.length > 0) return result;
          } catch (e) {
            console.log(e);
          }
        }
        return null;
      },

      findAllByAsciiText: async (
        text: string,
        ignoreCase: boolean
      ): Promise<IndexInfo[] | null> => {
        if (text.trim()) {
          try {
            const pattern = asciiToBytes(text);
            const result = findPatternIndices(buffer, pattern, ignoreCase).map(
              (item) => ({
                index: item,
                offset: pattern.length,
              })
            );

            if (result.length > 0) return result;
          } catch (e) {
            console.log(e);
          }
        }
        return null;
      },

      scrollToIndex: (index: number, offset: number): void => {
        const rowIndex = Math.floor(index / bytesPerRow);
        setScrollIndex(rowIndex);
        setSelectionRange({
          start: index,
          end: index + offset - 1,
          arrayBuffer: null,
        });
      },
    }),
    [buffer, setSelectionRange]
  );

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

  // 인코딩에 따라 문자 변환
  const byteToChar = (byte: number): string => {
    try {
      let decoder: TextDecoder;
      if (encoding === 'ascii') {
        // ASCII: 0x20~0x7E만 표시
        if (byte >= 0x20 && byte <= 0x7e) return String.fromCharCode(byte);
        return '.';
      }
      decoder = new TextDecoder(encoding as 'windows-1252' | 'utf-8' | 'ascii');
      const char = decoder.decode(new Uint8Array([byte]));
      const code = char.charCodeAt(0);
      if (
        (encoding === 'windows-1252' &&
          ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff))) ||
        (encoding === 'utf-8' && code >= 0x20)
      ) {
        return char;
      }
    } catch (e) {}
    return '.';
  };

  return (
    <>
      {/* 인코딩 옵션 셀렉트 박스 */}
      <div style={{ marginBottom: 8 }}>
        <label>
          인코딩:&nbsp;
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value)}
            style={{ fontSize: '1rem' }}
          >
            {encodingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <GridDiv
            height={height}
            width={width}
            // 가로
            columnCount={columnCount}
            columnWidth={getColumnWidth}
            // 세로
            rowCount={rowCount}
            rowHeight={rowHeight}
            // 랜더링 설정
            cellRenderer={cellRenderer}
            // 셀 고정
            scrollToRow={scrollIndex}
            scrollToAlignment={'start'}
            // 오버 스캔
            overscanColumnCount={2}
            overscanRowCount={20}
          />
        )}
      </AutoSizer>
      {contextMenu && (
        <ContextMenu
          ref={contextMenuRef}
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={closeContextMenu}
          onBlur={closeContextMenu}
        >
          <ContextMenuList>
            <ContextMenuItem>Option 1</ContextMenuItem>
            <ContextMenuItem>Option 2</ContextMenuItem>
            <ContextMenuItem>Option 3</ContextMenuItem>
          </ContextMenuList>
        </ContextMenu>
      )}
    </>
  );
};

export default forwardRef<HexViewerRef>(HexViewer);
