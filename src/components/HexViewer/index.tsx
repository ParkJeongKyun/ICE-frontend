import React, {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import debounce from 'lodash.debounce';
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
  findAllByAsciiText: (text: string) => Promise<IndexInfo[] | null>;
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

  // 마우스 이벤트
  const handleMouseDown = useCallback(
    (byteIndex: number) => {
      setIsDragging(true);
      setSelectionRange({
        start: byteIndex,
        end: byteIndex,
        arrayBuffer: null,
        // arrayBuffer: buffer.slice(byteIndex, byteIndex + 1),
      });
    },
    // [buffer, setSelectionRange]
    [setSelectionRange]
  );

  const handleMouseMove = useCallback(
    (byteIndex: number) => {
      if (isDragging) {
        let start: number | null;
        let end: number | null;

        // 뒤에서 앞으로 선택하는 경우
        if (Number(selectionRange.start) > byteIndex) {
          start = byteIndex;
          end = selectionRange.end;
        } else {
          start = selectionRange.start;
          end = byteIndex;
        }
        setSelectionRange({
          start: start,
          end: end,
          arrayBuffer: null,
          // arrayBuffer:
          //   start != null && end != null ? buffer.slice(start, end + 1) : null,
        });
      }
    },
    // [
    //   isDragging,
    //   selectionRange.start,
    //   selectionRange.end,
    //   buffer,
    //   setSelectionRange,
    // ]
    [isDragging, selectionRange.start, selectionRange.end, setSelectionRange]
  );

  const debouncedHandleMouseMove = useMemo(
    () => debounce(handleMouseMove, 10),
    [handleMouseMove]
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

  // RowRenderer 컴포넌트를 외부로 이동하여 불필요한 핸들러 재정의 방지
  const RowRenderer = useMemo(
    () =>
      React.memo(({ index, style }: ListChildComponentProps) => {
        const { offset, bytes, start } = getRowData(index);

        const selected =
          startIndex !== null &&
          endIndex !== null &&
          start <= Math.max(startIndex, endIndex) &&
          start + bytesPerRow - 1 >= Math.min(startIndex, endIndex);

        const hexRow: JSX.Element[] = [];
        const textRow: JSX.Element[] = [];

        bytes.forEach((byte: number, i: number) => {
          const byteIndex = start + i;
          const selected =
            startIndex !== null &&
            endIndex !== null &&
            byteIndex >= Math.min(startIndex!, endIndex!) &&
            byteIndex <= Math.max(startIndex!, endIndex!);

          hexRow.push(
            <HexByte
              key={i}
              $isEven={i % 2 === 0}
              $selected={selected}
              onMouseDown={() => handleMouseDown(byteIndex)}
              onMouseEnter={() => debouncedHandleMouseMove(byteIndex)}
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
              onMouseEnter={() => debouncedHandleMouseMove(byteIndex)}
              onMouseUp={handleMouseUp}
            >
              {str}
            </TextByte>
          );
        });

        return (
          <Row key={offset} style={style} $isMobile={isMobile}>
            <OffsetCell>
              <OffsetByte $selected={selected}>{offset}</OffsetByte>
            </OffsetCell>
            <HexCell>{hexRow}</HexCell>
            <TextCell>{textRow}</TextCell>
          </Row>
        );
      }),
    [
      startIndex,
      endIndex,
      getRowData,
      handleMouseDown,
      debouncedHandleMouseMove,
      handleMouseUp,
    ]
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
      // ASCII 텍스트로 찾는 함수
      const findAllByAsciiText = async (
        text: string
      ): Promise<IndexInfo[] | null> => {
        if (text.trim()) {
          try {
            const pattern = asciiToBytes(text);
            const result = findPatternIndices(buffer, pattern, true).map(
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
          // arrayBuffer: buffer.slice(index, index + offset),
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
