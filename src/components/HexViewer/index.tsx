import React, {
  useMemo,
  useState,
  useCallback,
  forwardRef,
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
import { List } from 'react-virtualized';
import { findPatternIndices } from 'utils/byteSearch';

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
  scrollToIndex: (rowIndex: number, offset: number) => void;
}

const byteToHex = (byte: number): string => {
  return ('0' + byte.toString(16)).slice(-2).toUpperCase();
};

const byteToChar = (byte: number): string => {
  if (byte >= 32 && byte <= 126) {
    return String.fromCharCode(byte);
  }
  return '.';
};

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef, Props> = (
  { arrayBuffer },
  ref
) => {
  // 가상 테이블 레퍼런스
  const listRef = React.useRef<List>(null);

  // 드래그 관련 변수
  const [isDragging, setIsDragging] = useState(false);
  const [startByteIndex, setStartByteIndex] = useState<number | null>(null);
  const [endByteIndex, setEndByteIndex] = useState<number | null>(null);

  // 분할용 변수
  const bytesPerRow = 16;
  const rowHeight = 22;
  const buffer = useMemo(() => new Uint8Array(arrayBuffer), [arrayBuffer]);
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

  // 마우스 이벤트
  const handleMouseDown = useCallback((byteIndex: number) => {
    setIsDragging(true);
    setStartByteIndex(byteIndex);
    setEndByteIndex(byteIndex);
  }, []);

  const handleMouseMove = useCallback(
    (byteIndex: number) => {
      if (isDragging) {
        setEndByteIndex(byteIndex);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getRowData = ({ index }: { index: number }) => {
    const start = index * bytesPerRow;
    const end = Math.min(start + bytesPerRow, buffer.length);
    const bytes = buffer.slice(start, end);
    const offset = start.toString(16).padStart(8, '0').toUpperCase();
    return { offset, bytes, start };
  };

  const rowRenderer = ({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    style: React.CSSProperties;
  }) => {
    const { offset, bytes, start } = getRowData({ index });

    const selected =
      startByteIndex !== null &&
      endByteIndex !== null &&
      start <= Math.max(startByteIndex, endByteIndex) &&
      start + bytesPerRow - 1 >= Math.min(startByteIndex, endByteIndex);

    const hexRow: JSX.Element[] = [];
    const textRow: JSX.Element[] = [];

    bytes.forEach((byte: number, i: number) => {
      const byteIndex = start + i;
      const selected =
        byteIndex >= Math.min(startByteIndex!, endByteIndex!) &&
        byteIndex <= Math.max(startByteIndex!, endByteIndex!);
      hexRow.push(
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
      const str = byteToChar(byte);
      textRow.push(
        <TextByte
          key={i}
          $isDot={str == '.'}
          $selected={selected}
          onMouseDown={() => handleMouseDown(byteIndex)}
          onMouseEnter={() => handleMouseMove(byteIndex)}
          onMouseUp={handleMouseUp}
        >
          {str}
        </TextByte>
      );
    });

    return (
      <Row key={offset} style={style}>
        <OffsetCell>
          <OffsetByte $selected={selected}>{offset}</OffsetByte>
        </OffsetCell>
        <HexCell>{hexRow}</HexCell>
        <TextCell>{textRow}</TextCell>
      </Row>
    );
  };

  useImperativeHandle(ref, () => {
    // 오프셋 검색
    const findByOffset = async (offset: string): Promise<IndexInfo | null> => {
      if (offset.trim()) {
        const byteOffset = parseInt(offset, 16);
        if (byteOffset) {
          return {
            index: byteOffset,
            offset: bytesPerRow,
          };
        }
      }
      return null;
    };
    // 헥스 값으로 찾기
    const findAllByHex = async (hex: string): Promise<IndexInfo[] | null> => {
      if (hex.trim()) {
        try {
          const pattern = new Uint8Array(
            hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
          );
          const result = findPatternIndices(buffer, pattern).map((item) => {
            return {
              index: item,
              offset: pattern.length,
            };
          });

          if (result.length > 0) return result;
        } catch (e) {
          console.log(e);
          return null;
        }
      }
      return null;
    };
    // 해당 위치로 스크롤 및 선택하기
    const scrollToIndex = (index: number, offset: number): void => {
      const rowIndex = Math.floor(index / bytesPerRow);
      listRef.current?.scrollToRow(rowIndex);
      setStartByteIndex(index);
      setEndByteIndex(index + offset - 1);
    };

    return {
      findByOffset,
      findAllByHex,
      scrollToIndex,
    };
  });

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => (
        <ListDiv
          width={width}
          height={height}
          rowCount={rowCount}
          rowHeight={rowHeight} // 각 행의 높이를 22으로 고정
          rowRenderer={rowRenderer}
          ref={listRef}
        />
      )}
    </AutoSizer>
  );
};

export default React.forwardRef(HexViewer);
