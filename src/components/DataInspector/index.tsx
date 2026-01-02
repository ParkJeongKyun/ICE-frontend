import Collapse from '@/components/common/Collapse';
import React, { useMemo, useState } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  EndianRadioGroup,
  EndianLabel,
  EndianRadio,
  SectionDiv,
  SectionTitleDiv,
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

    // 각 타입별로 하나의 값을 표기하기 위한 '최소 바이트' 기준
    const typeByteLimits = {
      bin: 1,        // 1바이트(8비트)만 표시
      base64: 3,     // base64는 3바이트가 4문자로 인코딩됨
      ascii: 1,      // 1바이트 = 1문자
      utf8: 1,       // 최소 1바이트(1문자), 실제로는 가변이지만 최소 단위
      utf16: 2,      // 최소 2바이트(1문자)
      UInt8: 1,
      UInt16: 2,
      UInt32: 4,
      UInt64: 8,
      Int8: 1,
      Int16: 2,
      Int32: 4,
      Int64: 8,
      Float32: 4,
      Float64: 8,
    };

    const getSlice = (size: number) => bytes.slice(0, size);

    // Raw 섹션
    const bin = bytesToBin(getSlice(typeByteLimits.bin));
    const base64 = bytesToBase64(getSlice(typeByteLimits.base64));

    // Text 섹션
    const ascii = Array.from(getSlice(typeByteLimits.ascii)).map((b) => byteToChar(b, 'ascii')).join('');
    const utf8 = new TextDecoder('utf-8').decode(getSlice(typeByteLimits.utf8));
    const utf16 = bytesToUtf16(getSlice(typeByteLimits.utf16), endian === 'le');

    // Integer/Float 섹션
    const makeIntInfo = (
      labels: string[],
      sizes: number[],
      fn: (b: Uint8Array, s: number, le: boolean) => bigint
    ) =>
      labels.map((label, i) => ({
        label,
        value: bytes.length >= sizes[i]
          ? fn(getSlice(sizes[i]), sizes[i], endian === 'le').toString()
          : '-',
      }));

    const unsigned = makeIntInfo(
      ['UInt8', 'UInt16', 'UInt32', 'UInt64'],
      [typeByteLimits.UInt8, typeByteLimits.UInt16, typeByteLimits.UInt32, typeByteLimits.UInt64],
      bytesToUnsigned
    );
    const signed = makeIntInfo(
      ['Int8', 'Int16', 'Int32', 'Int64'],
      [typeByteLimits.Int8, typeByteLimits.Int16, typeByteLimits.Int32, typeByteLimits.Int64],
      bytesToSigned
    );

    const float32 =
      bytes.length >= typeByteLimits.Float32
        ? bytesToFloat32(getSlice(typeByteLimits.Float32), endian === 'le')?.toString() ?? '-'
        : '-';
    const float64 =
      bytes.length >= typeByteLimits.Float64
        ? bytesToFloat64(getSlice(typeByteLimits.Float64), endian === 'le')?.toString() ?? '-'
        : '-';

    return {
      unsigned,
      signed,
      float32,
      float64,
      ascii,
      utf8,
      utf16,
      bin,
      base64,
    };
  }, [bytes, endian]);

  return (
    <Collapse
      title="Data Inspector"
      children={
        <>
          {bytes.length === 0 ? (
            <div style={{ color: '#888', padding: 8 }}>선택된 데이터 없음</div>
          ) : (
            <>
              <SectionDiv>
                <SectionTitleDiv>Raw</SectionTitleDiv>
                <ContentDiv>
                  <CellHeaderDiv>Binary</CellHeaderDiv>
                  <CellBodyDiv>{info?.bin}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>Base64</CellHeaderDiv>
                  <CellBodyDiv>{info?.base64}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
              <SectionDiv>
                <SectionTitleDiv>Text</SectionTitleDiv>
                <ContentDiv>
                  <CellHeaderDiv>ASCII</CellHeaderDiv>
                  <CellBodyDiv>{info?.ascii}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>UTF-8</CellHeaderDiv>
                  <CellBodyDiv>{info?.utf8}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>UTF-16</CellHeaderDiv>
                  <CellBodyDiv>{info?.utf16}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
              <SectionDiv>
                <SectionTitleDiv>Unsigned Integer</SectionTitleDiv>
                {info?.unsigned.map((item) => (
                  <ContentDiv key={item.label}>
                    <CellHeaderDiv>{item.label}</CellHeaderDiv>
                    <CellBodyDiv>{item.value}</CellBodyDiv>
                  </ContentDiv>
                ))}
              </SectionDiv>
              <SectionDiv>
                <SectionTitleDiv>Signed Integer</SectionTitleDiv>
                {info?.signed.map((item) => (
                  <ContentDiv key={item.label}>
                    <CellHeaderDiv>{item.label}</CellHeaderDiv>
                    <CellBodyDiv>{item.value}</CellBodyDiv>
                  </ContentDiv>
                ))}
              </SectionDiv>
              <SectionDiv>
                <SectionTitleDiv>Floating Point</SectionTitleDiv>
                <ContentDiv>
                  <CellHeaderDiv>Float32</CellHeaderDiv>
                  <CellBodyDiv>{info?.float32}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>Float64</CellHeaderDiv>
                  <CellBodyDiv>{info?.float64}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
            </>
          )}
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
        </>
      }
      open
    />
  );
};

export default React.memo(DataInspector);
