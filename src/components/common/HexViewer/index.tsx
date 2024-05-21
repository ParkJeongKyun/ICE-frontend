import React, { useState } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
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

interface HexRowProps {
  bytes: Uint8Array;
  bytesPerRow: number;
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

const HexRow: React.FC<ListChildComponentProps<HexRowProps>> = ({
  index,
  style,
  data,
}) => {
  const { bytes, bytesPerRow } = data;
  const start = index * bytesPerRow;
  const end = Math.min(start + bytesPerRow, bytes.length);
  const hexRow: string[] = [];
  const textRow: string[] = [];

  for (let i = start; i < end; i++) {
    hexRow.push(byteToHex(bytes[i]));
    textRow.push(byteToChar(bytes[i]));
  }

  const offset = start.toString(16).padStart(8, '0').toUpperCase();
  const [hoveredHex, setHoveredHex] = useState<number | null>(null);

  return (
    <Row style={style}>
      <OffsetCell>{offset}</OffsetCell>
      <HexCell>
        {hexRow.map((h, i) => (
          <HexByte
            key={i}
            onMouseEnter={() => setHoveredHex(i)}
            onMouseLeave={() => setHoveredHex(null)}
            className={hoveredHex === i ? 'hovered' : ''}
          >
            {h}
          </HexByte>
        ))}
      </HexCell>
      <TextCell>
        {textRow.map((t, i) => (
          <TextByte
            key={i}
            onMouseEnter={() => setHoveredHex(i)}
            onMouseLeave={() => setHoveredHex(null)}
            className={`${hoveredHex === i ? 'hovered' : ''} ${t == '.' ? 'isDot' : ''}`}
          >
            {t}
          </TextByte>
        ))}
      </TextCell>
    </Row>
  );
};

const HexViewer: React.FC<HexViewerProps> = ({ arrayBuffer }) => {
  const bytes = new Uint8Array(arrayBuffer);
  const bytesPerRow = 16;
  const rowCount = Math.ceil(bytes.length / bytesPerRow);

  return (
    <AutoSizer>
      {({ height, width }: Size) => (
        <List
          height={height}
          width={width}
          itemCount={rowCount}
          itemSize={25}
          itemData={{ bytes, bytesPerRow }}
        >
          {HexRow}
        </List>
      )}
    </AutoSizer>
  );
};

export default HexViewer;
