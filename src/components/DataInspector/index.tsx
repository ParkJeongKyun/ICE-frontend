import Collapse from '@/components/common/Collapse';
import React, { useMemo, useState } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  EndianRadioGroup,
  EndianLabel,
  EndianRadio,
} from './index.styles';
import { useTabData } from '@/contexts/TabDataContext';
import {
  bytesToUnsigned,
  bytesToSigned,
  bytesToFloat32,
  bytesToFloat64,
  bytesToUtf16,
  bytesToUintArray,
  bytesToBin,
  bytesToBase64,
} from '@/utils/dataInspector';
import { byteToChar, byteToHex } from '@/utils/encoding';

const DataInspector: React.FC = () => {
  const { activeKey, selectionStates } = useTabData();
  const selectionRange = selectionStates[activeKey] || {
    start: null,
    end: null,
    selectedBytes: undefined,
  };
  const bytes = selectionRange.selectedBytes ?? new Uint8Array();
  const [endian, setEndian] = useState<'le' | 'be'>('le');

  const info = useMemo(() => {
    if (!bytes || bytes.length === 0) return null;

    const makeIntInfo = (labels: string[], sizes: number[], fn: (b: Uint8Array, s: number, le: boolean) => bigint) =>
      labels.map((label, i) => ({
        label,
        value: bytes.length >= sizes[i] ? fn(bytes, sizes[i], endian === 'le').toString() : '-',
      }));

    const unsigned = makeIntInfo(['UInt8', 'UInt16', 'UInt32', 'UInt64'], [1, 2, 4, 8], bytesToUnsigned);
    const signed = makeIntInfo(['Int8', 'Int16', 'Int32', 'Int64'], [1, 2, 4, 8], bytesToSigned);

    const float32 =
      bytes.length >= 4
        ? bytesToFloat32(bytes, endian === 'le')?.toString() ?? '-'
        : '-';
    const float64 =
      bytes.length >= 8
        ? bytesToFloat64(bytes, endian === 'le')?.toString() ?? '-'
        : '-';

    const ascii = Array.from(bytes).map((b) => byteToChar(b, 'ascii')).join('');
    const utf8 = new TextDecoder('utf-8').decode(bytes);
    const utf16le = bytesToUtf16(bytes, true);
    const utf16be = bytesToUtf16(bytes, false);
    const hex = Array.from(bytes).map(byteToHex).join(' ');
    const dec = bytesToUintArray(bytes).join(' ');
    const bin = bytesToBin(bytes);
    const base64 = bytesToBase64(bytes);

    return {
      unsigned,
      signed,
      float32,
      float64,
      ascii,
      utf8,
      utf16le,
      utf16be,
      hex,
      dec,
      bin,
      base64,
    };
  }, [bytes, endian]);

  return (
    <Collapse
      title="Data Inspector"
      children={
        <>
          {/* 엔디안 선택 라디오 */}
          <EndianRadioGroup>
            <EndianLabel>
              <EndianRadio
                name="endian"
                value="le"
                checked={endian === 'le'}
                onChange={() => setEndian('le')}
              />
              Little Endian
            </EndianLabel>
            <EndianLabel>
              <EndianRadio
                name="endian"
                value="be"
                checked={endian === 'be'}
                onChange={() => setEndian('be')}
              />
              Big Endian
            </EndianLabel>
          </EndianRadioGroup>
          {bytes.length === 0 ? (
            <div style={{ color: '#888', padding: 8 }}>선택된 데이터 없음</div>
          ) : (
            <>
              <ContentDiv>
                <CellHeaderDiv>Hex</CellHeaderDiv>
                <CellBodyDiv>{info?.hex}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>Decimal</CellHeaderDiv>
                <CellBodyDiv>{info?.dec}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>Binary</CellHeaderDiv>
                <CellBodyDiv>{info?.bin}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>ASCII</CellHeaderDiv>
                <CellBodyDiv>{info?.ascii}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>UTF-8</CellHeaderDiv>
                <CellBodyDiv>{info?.utf8}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>UTF-16LE</CellHeaderDiv>
                <CellBodyDiv>{info?.utf16le}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>UTF-16BE</CellHeaderDiv>
                <CellBodyDiv>{info?.utf16be}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>Base64</CellHeaderDiv>
                <CellBodyDiv>{info?.base64}</CellBodyDiv>
              </ContentDiv>
              {info?.unsigned.map((item) => (
                <ContentDiv key={item.label}>
                  <CellHeaderDiv>{item.label}</CellHeaderDiv>
                  <CellBodyDiv>{item.value}</CellBodyDiv>
                </ContentDiv>
              ))}
              {info?.signed.map((item) => (
                <ContentDiv key={item.label}>
                  <CellHeaderDiv>{item.label}</CellHeaderDiv>
                  <CellBodyDiv>{item.value}</CellBodyDiv>
                </ContentDiv>
              ))}
              <ContentDiv>
                <CellHeaderDiv>Float32</CellHeaderDiv>
                <CellBodyDiv>{info?.float32}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>Float64</CellHeaderDiv>
                <CellBodyDiv>{info?.float64}</CellBodyDiv>
              </ContentDiv>
            </>
          )}
        </>
      }
      open
    />
  );
};

export default React.memo(DataInspector);
