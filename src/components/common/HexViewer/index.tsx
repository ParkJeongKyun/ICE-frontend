import React, { useMemo } from 'react';
import { List } from 'react-virtualized';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  HexByte,
  HexCell,
  OffsetCell,
  Row,
  TextByte,
  TextCell,
} from './index.styles';

interface HexViewerProps {
  arrayBuffer: ArrayBuffer;
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

const HexViewer: React.FC<HexViewerProps> = ({ arrayBuffer }) => {
  const bytesPerRow = 16;
  const buffer = useMemo(() => new Uint8Array(arrayBuffer), [arrayBuffer]);
  const rowCount = Math.ceil(buffer.length / bytesPerRow);

  const getRowData = ({ index }: { index: number }) => {
    const start = index * bytesPerRow;
    const end = Math.min(start + bytesPerRow, buffer.length);
    const bytes = buffer.slice(start, end);
    const offset = start.toString(16).padStart(8, '0').toUpperCase();
    return { offset, bytes };
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
    const { offset, bytes } = getRowData({ index });

    const hexRow: JSX.Element[] = [];
    const textRow: JSX.Element[] = [];

    bytes.forEach((byte: number, i: number) => {
      hexRow.push(<HexByte key={i}>{byteToHex(byte)}</HexByte>);
      textRow.push(<TextByte key={i}>{byteToChar(byte)}</TextByte>);
    });

    return (
      <Row key={key} style={style}>
        <OffsetCell>{offset}</OffsetCell>
        <HexCell>{hexRow}</HexCell>
        <TextCell>{textRow}</TextCell>
      </Row>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => (
        <List
          width={width}
          height={height}
          rowCount={rowCount}
          rowHeight={30} // 각 행의 높이를 30으로 고정
          rowRenderer={rowRenderer}
        />
      )}
    </AutoSizer>
  );
};

export default HexViewer;
