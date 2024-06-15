import React, {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
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
  const decoder = new TextDecoder('windows-1252'); // ANSI에 해당하는 인코딩 사용
  const byteArr = new Uint8Array([byte]);

  try {
    const char = decoder.decode(byteArr);
    const code = char.charCodeAt(0);

    // ASCII 프린트 가능한 문자 및 확장된 ANSI 프린트 가능한 문자 확인
    if (
      (code >= 0x20 && code <= 0x7e) || // ASCII printable characters
      (code >= 0xa0 && code <= 0xff) // Extended ANSI printable characters
    ) {
      return char;
    }
  } catch (e) {
    // 디코딩에 실패하면 무시하고 '.' 반환
  }

  // 범위 내 바이트 값에 대해 '.' 반환
  return '.'; // Non-printable characters
};

const HexViewer: React.ForwardRefRenderFunction<HexViewerRef, Props> = (
  { arrayBuffer },
  ref
) => {
  // 가상 테이블 레퍼런스
  const listRef = React.useRef<List>(null);

  // 드래그 관련 변수
  const [isDragging, setIsDragging] = useState(false);
  const { selectionRange, setSelectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;

  // 분할용 변수
  const bytesPerRow = 16;
  const rowHeight = 22;
  const buffer = useMemo(() => new Uint8Array(arrayBuffer), [arrayBuffer]);
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

  // 마우스 이벤트 핸들러
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

          if (Number(prev.start) > byteIndex) {
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

  // 선택된 상태를 미리 계산하여 사용
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

  // 셀 렌더링 최적화
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

  const RowRenderer = useMemo(
    () =>
      React.memo(({ index, style }: ListChildComponentProps) => {
        const { offset, bytes, start } = getRowData(index);

        const hexRow: JSX.Element[] = [];
        const textRow: JSX.Element[] = [];

        bytes.forEach((byte, i) => {
          hexRow.push(renderHexByte(byte, i, start));
          textRow.push(renderTextByte(byte, i, start));
        });

        return (
          <Row key={offset} style={style} $isMobile={isMobile}>
            <OffsetCell>
              <OffsetByte $selected={isSelected(start)}>{offset}</OffsetByte>
            </OffsetCell>
            <HexCell>{hexRow}</HexCell>
            <TextCell>{textRow}</TextCell>
          </Row>
        );
      }),
    [getRowData, isSelected, renderHexByte, renderTextByte]
  );

  useImperativeHandle(
    ref,
    () => {
      // 오프셋 검색
      const findByOffset = async (
        offset: string
      ): Promise<IndexInfo | null> => {
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

      // ASCII 텍스트로 찾기
      const findAllByAsciiText = async (
        text: string,
        ignoreCase: boolean
      ): Promise<IndexInfo[] | null> => {
        if (text.trim()) {
          try {
            const pattern = asciiToBytes(text);
            const result = findPatternIndices(buffer, pattern, ignoreCase).map(
              (item) => {
                return {
                  index: item,
                  offset: pattern.length,
                };
              }
            );

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
        listRef.current?.scrollToItem(rowIndex, 'start');
        setSelectionRange({
          start: index,
          end: index + offset - 1,
          arrayBuffer: null,
        });
      };

      return {
        findByOffset,
        findAllByHex,
        findAllByAsciiText,
        scrollToIndex,
      };
    },
    [buffer, setSelectionRange]
  );

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => (
        <ListDiv
          height={height}
          width={width}
          itemCount={rowCount}
          itemSize={rowHeight}
          overscanCount={100}
          ref={listRef}
        >
          {RowRenderer}
        </ListDiv>
      )}
    </AutoSizer>
  );
};

export default React.forwardRef(HexViewer);
