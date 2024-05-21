import React, { useState } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import styled from 'styled-components';

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
        {textRow.map((h, i) => (
          <TextByte
            key={i}
            onMouseEnter={() => setHoveredHex(i)}
            onMouseLeave={() => setHoveredHex(null)}
            className={`${hoveredHex === i ? 'hovered' : ''} ${h == '.' ? 'isDot' : ''}`}
          >
            {h}
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
    <List
      height={600}
      itemCount={rowCount}
      itemSize={25}
      width={800}
      itemData={{ bytes, bytesPerRow }}
    >
      {HexRow}
    </List>
  );
};

export default HexViewer;

// Styled components
const Row = styled.div`
  display: flex;
  font-family: monospace;
`;

const OffsetCell = styled.div`
  width: 80px;
  color: white;
  &:hover {
    background-color: #e6f7ff;
  }
`;

const HexCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 320px;
`;

const TextCell = styled.div`
  width: 160px;
`;

const HexByte = styled.span`
  display: inline-block;
  width: 2ch;
  margin: 2px;
  text-align: center;
  color: white;
  &.hovered {
    background-color: #e6f7ff;
  }
`;

const TextByte = styled.span`
  display: inline-block;
  width: 1ch;
  margin: 1px;
  text-align: center;
  color: blue;
  &.hovered {
    background-color: #e6f7ff;
  }
  &.isDot {
    color: white;
  }
`;
