import React, {
  useMemo,
  useState,
  useCallback,
  useImperativeHandle,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  HexByte,
  HexCell,
  ListDiv,
  OffsetByte,
  OffsetCell,
  Row,
  TextByte,
  TextCell,
} from './index.styles';
import { asciiToBytes, findPatternIndices } from 'utils/byteSearch';
import { useSelection } from 'contexts/SelectionContext';
import { isMobile } from 'react-device-detect';
import { VirtuosoHandle } from 'react-virtuoso';

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
  // 가상 테이블 레퍼런스
  const listRef = React.useRef<VirtuosoHandle>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { selectionRange, setSelectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;
  const bytesPerRow = 16;
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

  const RowRenderer = ({ index }: { index: number }): JSX.Element => {
    const { offset, bytes, start } = getRowData(index);

    const hexRow: JSX.Element[] = [];
    const textRow: JSX.Element[] = [];

    bytes.forEach((byte, i) => {
      hexRow.push(renderHexByte(byte, i, start));
      textRow.push(renderTextByte(byte, i, start));
    });

    return (
      <Row key={offset} $isMobile={isMobile}>
        <OffsetCell>
          <OffsetByte $selected={isSelected(start)}>{offset}</OffsetByte>
        </OffsetCell>
        <HexCell>{hexRow}</HexCell>
        <TextCell>{textRow}</TextCell>
      </Row>
    );
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
        listRef.current?.scrollToIndex({ index: rowIndex, align: 'start' });
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
        <ListDiv
          ref={listRef}
          style={{ height, width }}
          totalCount={rowCount}
          itemContent={(index) => <RowRenderer index={index} />}
        />
      )}
    </AutoSizer>
  );
};

export default React.forwardRef(HexViewer);
