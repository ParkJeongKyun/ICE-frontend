import Collapse from '@/components/common/Collapse';
import React, { useMemo, useState } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import { useTabData } from '@/contexts/TabDataContext';

function bytesToUnsignedLE(bytes: Uint8Array, size: number) {
  let val = 0n;
  for (let i = 0; i < size && i < bytes.length; ++i) {
    val |= BigInt(bytes[i]) << BigInt(8 * i);
  }
  return val;
}
function bytesToUnsignedBE(bytes: Uint8Array, size: number) {
  let val = 0n;
  for (let i = 0; i < size && i < bytes.length; ++i) {
    val = (val << 8n) | BigInt(bytes[i]);
  }
  return val;
}
function bytesToSignedLE(bytes: Uint8Array, size: number) {
  const unsigned = bytesToUnsignedLE(bytes, size);
  const signBit = 1n << BigInt(size * 8 - 1);
  return (unsigned & signBit) ? unsigned - (signBit << 1n) : unsigned;
}
function bytesToSignedBE(bytes: Uint8Array, size: number) {
  const unsigned = bytesToUnsignedBE(bytes, size);
  const signBit = 1n << BigInt(size * 8 - 1);
  return (unsigned & signBit) ? unsigned - (signBit << 1n) : unsigned;
}
function bytesToFloat32(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < 4) return null;
  const buf = new ArrayBuffer(4);
  const view = new Uint8Array(buf);
  if (littleEndian) view.set(bytes.slice(0, 4));
  else view.set(bytes.slice(0, 4).reverse());
  return new DataView(buf).getFloat32(0, littleEndian);
}
function bytesToFloat64(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < 8) return null;
  const buf = new ArrayBuffer(8);
  const view = new Uint8Array(buf);
  if (littleEndian) view.set(bytes.slice(0, 8));
  else view.set(bytes.slice(0, 8).reverse());
  return new DataView(buf).getFloat64(0, littleEndian);
}
function bytesToAscii(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
    .join('');
}
function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}
function bytesToBase64(bytes: Uint8Array) {
  if (!bytes.length) return '';
  return btoa(String.fromCharCode(...bytes));
}
function bytesToUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}
function bytesToUtf16LE(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-16le').decode(bytes);
  } catch {
    return '';
  }
}
function bytesToUtf16BE(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-16be').decode(bytes);
  } catch {
    return '';
  }
}
function bytesToUintArray(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString());
}
function bytesToBin(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

const DataInspector: React.FC = () => {
  const { activeKey, selectionStates } = useTabData();
  const selectionRange = selectionStates[activeKey] || {
    start: null,
    end: null,
    selectedBytes: undefined,
  };
  const bytes = selectionRange.selectedBytes ?? new Uint8Array();

  // 엔디안 선택 상태
  const [endian, setEndian] = useState<'le' | 'be'>('le');

  const info = useMemo(() => {
    if (!bytes || bytes.length === 0) return null;
    // 엔디안별 결과만 분리
    const unsigned = [
      { label: 'UInt8', size: 1 },
      { label: 'UInt16', size: 2 },
      { label: 'UInt32', size: 4 },
      { label: 'UInt64', size: 8 },
    ].map(({ label, size }) => ({
      label,
      value:
        bytes.length >= size
          ? (endian === 'le'
            ? bytesToUnsignedLE(bytes, size)
            : bytesToUnsignedBE(bytes, size)
          ).toString()
          : '-',
    }));
    const signed = [
      { label: 'Int8', size: 1 },
      { label: 'Int16', size: 2 },
      { label: 'Int32', size: 4 },
      { label: 'Int64', size: 8 },
    ].map(({ label, size }) => ({
      label,
      value:
        bytes.length >= size
          ? (endian === 'le'
            ? bytesToSignedLE(bytes, size)
            : bytesToSignedBE(bytes, size)
          ).toString()
          : '-',
    }));
    const float32 =
      bytes.length >= 4
        ? (endian === 'le'
          ? bytesToFloat32(bytes, true)
          : bytesToFloat32(bytes, false)
        )?.toString() ?? '-'
        : '-';
    const float64 =
      bytes.length >= 8
        ? (endian === 'le'
          ? bytesToFloat64(bytes, true)
          : bytesToFloat64(bytes, false)
        )?.toString() ?? '-'
        : '-';
    const ascii = bytesToAscii(bytes);
    const utf8 = bytesToUtf8(bytes);
    const utf16le = bytesToUtf16LE(bytes);
    const utf16be = bytesToUtf16BE(bytes);
    const hex = bytesToHex(bytes);
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
          <div style={{ padding: 8 }}>
            <label>
              <input
                type="radio"
                name="endian"
                value="le"
                checked={endian === 'le'}
                onChange={() => setEndian('le')}
              />
              Little Endian
            </label>
            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                name="endian"
                value="be"
                checked={endian === 'be'}
                onChange={() => setEndian('be')}
              />
              Big Endian
            </label>
          </div>
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
