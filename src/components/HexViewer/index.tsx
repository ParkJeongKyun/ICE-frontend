import React, {
  useMemo,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
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
} from './index.styles';
import { asciiToBytes, findPatternIndices } from 'utils/byteSearch';
import { useSelection } from 'contexts/SelectionContext';

interface Props {
  arrayBuffer: ArrayBuffer;
}

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

const byteToChar = (byte: number): string => {
  const decoder = new TextDecoder('windows-1252');
  const byteArr = new Uint8Array([byte]);

  try {
    const char = decoder.decode(byteArr);
    const code = char.charCodeAt(0);

    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) {
      return char;
    }
  } catch (e) {}

  return '.';
};

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef, Props> = (
  { arrayBuffer },
  ref
) => {
  const [scrollIndex, setScrollIndex] = React.useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const { selectionRange, setSelectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;
  const bytesPerRow = 16;
  const rowHeight = 30;
  const columnCount = 3;
  const buffer = useMemo(() => new Uint8Array(arrayBuffer), [arrayBuffer]);
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

  const handleMouseDown = useCallback(
    (byteIndex: number) => {
      setIsDragging(true);
      setSelectionRange((prev) => ({
        ...prev,
        start: byteIndex,
        end: byteIndex,
      }));
    },
    [setSelectionRange]
  );

  const handleMouseMove = useCallback(
    (byteIndex: number) => {
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

  const getColumnWidth = ({ index }: { index: number }): number => {
    const widths = [100, 360, 200];
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
        onMouseDown={() => handleMouseDown(byteIndex)}
        onMouseEnter={() => handleMouseMove(byteIndex)}
        onMouseUp={handleMouseUp}
      >
        {byteToHex(byte)}
      </HexByte>
    );
  };

  const renderTextByte = (
    byte: number,
    i: number,
    start: number
  ): JSX.Element => {
    const byteIndex = start + i;
    const selected = isSelected(byteIndex);
    const str = byteToChar(byte);

    return (
      <TextByte
        key={i}
        $isDot={str === '.'}
        $selected={selected}
        onMouseDown={() => handleMouseDown(byteIndex)}
        onMouseEnter={() => handleMouseMove(byteIndex)}
        onMouseUp={handleMouseUp}
      >
        {str}
      </TextByte>
    );
  };

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }: GridCellProps) => {
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
  };

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

  return (
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
  );
};

export default forwardRef(HexViewer);
