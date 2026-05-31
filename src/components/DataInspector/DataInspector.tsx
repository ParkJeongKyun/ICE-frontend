'use client';
import Collapse from '@/components/common/Collapse/Collapse';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  EndianRadioGroup,
  EndianButton,
  SectionDiv,
  NotSelectedDiv,
  JumpButton,
} from './DataInspector.styles';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useSelection } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import DoubleChevronsRightIcon from '@/components/common/Icons/DoubleChevronsRightIcon';
import {
  bytesToUnsigned,
  bytesToSigned,
  bytesToFloat32,
  bytesToFloat64,
  bytesToUtf16,
  bytesToBin,
  bytesToBase64,
  decodeULEB128,
  decodeSLEB128,
  bytesToUnsignedInt24,
  bytesToSignedInt24,
  bytesToOLETIME,
  bytesToFILETIME,
  bytesToDOSDate,
  bytesToDOSTime,
  bytesToDOSDateTime,
  bytesToTimeT32,
  bytesToTimeT64,
  bytesToGUID,
  MIN_BYTE_LENGTHS,
} from '@/utils/dataInspector';
import { byteToChar } from '@/utils/encoding';
import { formatOffset } from '@/utils/formatters';

const DataInspector: React.FC = () => {
  const t = useTranslations();
  const { config } = useConfig();
  const { searcherRef } = useRefs();
  const { activeData } = useTab();
  const { activeSelectionState } = useSelection();
  const [endian, setEndian] = useState<'le' | 'be'>('le');

  const bytes = activeSelectionState?.selectedBytes ?? new Uint8Array();
  const fileSize = activeData?.file?.size ?? 0;

  // 상대 오프셋 이동 핸들러
  const handleJumpToOffset = useCallback(
    async (offset: number) => {
      if (!searcherRef?.current) return;

      // selection 시작점 기준 또는 cursor 기준, 없으면 0
      const base =
        activeSelectionState?.start ?? activeSelectionState?.cursor ?? 0;
      const targetOffset = base + offset;
      if (targetOffset < 0 || targetOffset >= fileSize) return;

      await searcherRef.current.findByOffset(targetOffset);
    },
    [
      searcherRef,
      activeSelectionState?.start,
      activeSelectionState?.cursor,
      fileSize,
    ]
  );

  // 절대 오프셋 이동 핸들러
  const handleJumpToAbsoluteOffset = useCallback(
    async (offset: number) => {
      if (!searcherRef?.current) return;

      if (offset < 0 || offset >= fileSize) return;

      await searcherRef.current.findByOffset(offset);
    },
    [searcherRef, fileSize]
  );

  const info = useMemo(() => {
    if (!bytes || bytes.length === 0) return null;

    const getSlice = (size: number) => bytes.slice(0, size);

    // Raw 섹션
    const bin = bytesToBin(getSlice(MIN_BYTE_LENGTHS.UInt8));
    const base64 = bytesToBase64(getSlice(3)); // base64는 3바이트 고정

    // Text 섹션
    const ascii = Array.from(getSlice(MIN_BYTE_LENGTHS.UInt8))
      .map((b) => byteToChar(b, 'ascii'))
      .join('');
    const utf8 = new TextDecoder('utf-8').decode(
      getSlice(MIN_BYTE_LENGTHS.UInt8)
    ); // UInt8 사용
    const utf16 = bytesToUtf16(
      getSlice(MIN_BYTE_LENGTHS.UInt16),
      endian === 'le'
    ); // UInt16 사용

    // Integer (Unsigned + Signed + Int24 + LEB128)
    const intLabels = [
      t('dataInspector.dataTypes.uint8'),
      t('dataInspector.dataTypes.int8'),
      t('dataInspector.dataTypes.uint16'),
      t('dataInspector.dataTypes.int16'),
      t('dataInspector.dataTypes.uint24'),
      t('dataInspector.dataTypes.int24'),
      t('dataInspector.dataTypes.uint32'),
      t('dataInspector.dataTypes.int32'),
      t('dataInspector.dataTypes.uint64'),
      t('dataInspector.dataTypes.int64'),
      t('dataInspector.dataTypes.uleb128'),
      t('dataInspector.dataTypes.sleb128'),
    ];
    const intValues = [
      bytes.length >= MIN_BYTE_LENGTHS.UInt8
        ? bytesToUnsigned(
            getSlice(MIN_BYTE_LENGTHS.UInt8),
            MIN_BYTE_LENGTHS.UInt8,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.Int8
        ? bytesToSigned(
            getSlice(MIN_BYTE_LENGTHS.Int8),
            MIN_BYTE_LENGTHS.Int8,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.UInt16
        ? bytesToUnsigned(
            getSlice(MIN_BYTE_LENGTHS.UInt16),
            MIN_BYTE_LENGTHS.UInt16,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.Int16
        ? bytesToSigned(
            getSlice(MIN_BYTE_LENGTHS.Int16),
            MIN_BYTE_LENGTHS.Int16,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.UInt24
        ? bytesToUnsignedInt24(
            getSlice(MIN_BYTE_LENGTHS.UInt24),
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.Int24
        ? bytesToSignedInt24(
            getSlice(MIN_BYTE_LENGTHS.Int24),
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.UInt32
        ? bytesToUnsigned(
            getSlice(MIN_BYTE_LENGTHS.UInt32),
            MIN_BYTE_LENGTHS.UInt32,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.Int32
        ? bytesToSigned(
            getSlice(MIN_BYTE_LENGTHS.Int32),
            MIN_BYTE_LENGTHS.Int32,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.UInt64
        ? bytesToUnsigned(
            getSlice(MIN_BYTE_LENGTHS.UInt64),
            MIN_BYTE_LENGTHS.UInt64,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length >= MIN_BYTE_LENGTHS.Int64
        ? bytesToSigned(
            getSlice(MIN_BYTE_LENGTHS.Int64),
            MIN_BYTE_LENGTHS.Int64,
            endian === 'le'
          ).toString()
        : '-',
      bytes.length > 0 ? decodeULEB128(bytes) : '-',
      bytes.length > 0 ? decodeSLEB128(bytes) : '-',
    ];
    const integers = intLabels.map((label, i) => ({
      label,
      value: intValues[i],
    }));

    // Floating Point
    const float32 =
      bytes.length >= MIN_BYTE_LENGTHS.Float32
        ? (() => {
            const v = bytesToFloat32(
              getSlice(MIN_BYTE_LENGTHS.Float32),
              endian === 'le'
            );
            return v !== null && v !== undefined ? v.toExponential() : '-';
          })()
        : '-';
    const float64 =
      bytes.length >= MIN_BYTE_LENGTHS.Float64
        ? (() => {
            const v = bytesToFloat64(
              getSlice(MIN_BYTE_LENGTHS.Float64),
              endian === 'le'
            );
            return v !== null && v !== undefined ? v.toExponential() : '-';
          })()
        : '-';

    // Time/Date
    const oletime =
      bytes.length >= MIN_BYTE_LENGTHS.OLETIME
        ? bytesToOLETIME(
            getSlice(MIN_BYTE_LENGTHS.OLETIME),
            endian === 'le',
            config.ui.dateFormat
          )
        : '-';
    const filetime =
      bytes.length >= MIN_BYTE_LENGTHS.FILETIME
        ? bytesToFILETIME(
            getSlice(MIN_BYTE_LENGTHS.FILETIME),
            endian === 'le',
            config.ui.dateFormat
          )
        : '-';
    const dosdate =
      bytes.length >= MIN_BYTE_LENGTHS.DOSDATE
        ? bytesToDOSDate(
            getSlice(MIN_BYTE_LENGTHS.DOSDATE),
            endian === 'le',
            config.ui.dateFormat
          )
        : '-';
    const dostime =
      bytes.length >= MIN_BYTE_LENGTHS.DOSTIME
        ? bytesToDOSTime(getSlice(MIN_BYTE_LENGTHS.DOSTIME), endian === 'le')
        : '-';
    const dosdatetime =
      bytes.length >= MIN_BYTE_LENGTHS.DOSDATETIME
        ? bytesToDOSDateTime(
            getSlice(MIN_BYTE_LENGTHS.DOSDATETIME),
            endian === 'le',
            config.ui.dateFormat
          )
        : '-';
    const timet32 =
      bytes.length >= MIN_BYTE_LENGTHS.TIMET32
        ? bytesToTimeT32(
            getSlice(MIN_BYTE_LENGTHS.TIMET32),
            endian === 'le',
            config.ui.dateFormat
          )
        : '-';
    const timet64 =
      bytes.length >= MIN_BYTE_LENGTHS.TIMET64
        ? bytesToTimeT64(
            getSlice(MIN_BYTE_LENGTHS.TIMET64),
            endian === 'le',
            config.ui.dateFormat
          )
        : '-';

    // GUID
    const guid =
      bytes.length >= MIN_BYTE_LENGTHS.GUID
        ? bytesToGUID(getSlice(MIN_BYTE_LENGTHS.GUID), endian === 'le')
        : '-';

    return {
      integers,
      float32,
      float64,
      ascii,
      utf8,
      utf16,
      bin,
      base64,
      oletime,
      filetime,
      dosdate,
      dostime,
      dosdatetime,
      timet32,
      timet64,
      guid,
    };
  }, [bytes, endian]);

  return (
    <Collapse
      title={t('dataInspector.title')}
      children={
        <>
          {/* 엔디안 선택 탭 */}
          <EndianRadioGroup>
            <Tooltip text={t('dataInspector.littleEndianTooltip')}>
              <EndianButton
                $active={endian === 'le'}
                onClick={() => setEndian('le')}
              >
                {t('dataInspector.littleEndian')}
              </EndianButton>
            </Tooltip>
            <Tooltip text={t('dataInspector.bigEndianTooltip')}>
              <EndianButton
                $active={endian === 'be'}
                onClick={() => setEndian('be')}
              >
                {t('dataInspector.bigEndian')}
              </EndianButton>
            </Tooltip>
          </EndianRadioGroup>
          {bytes.length === 0 ? (
            <NotSelectedDiv>{t('dataInspector.noSelection')}</NotSelectedDiv>
          ) : (
            <>
              <SectionDiv>
                {info?.integers.map((item) => {
                  const numValue = parseInt(item.value, 10);
                  const isValidNumber = item.value !== '-' && !isNaN(numValue);

                  if (!isValidNumber) {
                    return (
                      <ContentDiv key={item.label}>
                        <CellHeaderDiv>{item.label}</CellHeaderDiv>
                        <CellBodyDiv>
                          <span>{item.value}</span>
                        </CellBodyDiv>
                      </ContentDiv>
                    );
                  }

                  const targetOffset =
                    activeSelectionState?.start !== null
                      ? activeSelectionState.start + numValue
                      : null;
                  const canJumpRelative =
                    activeSelectionState?.start !== null &&
                    numValue !== 0 &&
                    targetOffset !== null &&
                    targetOffset >= 0 &&
                    targetOffset < fileSize;
                  const canJumpAbsolute = numValue >= 0 && numValue < fileSize;

                  return (
                    <ContentDiv key={item.label}>
                      <CellHeaderDiv>
                        {item.label}
                        {canJumpRelative && (
                          <Tooltip
                            text={t('dataInspector.relativeJumpTooltip', {
                              current: formatOffset(
                                activeSelectionState?.start || 0,
                                config.ui.numberBase
                              ),
                              operator: numValue >= 0 ? '+' : '',
                              value: item.value,
                              target: formatOffset(
                                targetOffset!,
                                config.ui.numberBase
                              ),
                            })}
                          >
                            <JumpButton
                              onClick={() => handleJumpToOffset(numValue)}
                              aria-label={t('dataInspector.jumpRelative')}
                            >
                              <DoubleChevronsRightIcon width={14} height={14} />
                            </JumpButton>
                          </Tooltip>
                        )}
                      </CellHeaderDiv>
                      <CellBodyDiv>
                        <span>{item.value}</span>
                        {canJumpAbsolute && (
                          <Tooltip
                            text={t('dataInspector.absoluteJumpTooltip', {
                              target: formatOffset(
                                numValue,
                                config.ui.numberBase
                              ),
                              targetDec: numValue,
                            })}
                          >
                            <JumpButton
                              onClick={() =>
                                handleJumpToAbsoluteOffset(numValue)
                              }
                              aria-label={t('dataInspector.jumpAbsolute')}
                            >
                              <ChevronRightIcon width={14} height={14} />
                            </JumpButton>
                          </Tooltip>
                        )}
                      </CellBodyDiv>
                    </ContentDiv>
                  );
                })}
              </SectionDiv>
              <SectionDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.float32')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.float32}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.float64')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.float64}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
              <SectionDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.binary')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.bin}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.base64')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.base64}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
              <SectionDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.ascii')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.ascii}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.utf8')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.utf8}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.utf16')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.utf16}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
              <SectionDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.oletime')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.oletime}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.filetime')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.filetime}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.dosDate')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.dosdate}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.dosTime')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.dostime}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.dosDateTime')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.dosdatetime}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.timeT32')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.timet32}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.timeT64')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.timet64}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
              <SectionDiv>
                <ContentDiv>
                  <CellHeaderDiv>
                    {t('dataInspector.dataTypes.guid')}
                  </CellHeaderDiv>
                  <CellBodyDiv>{info?.guid}</CellBodyDiv>
                </ContentDiv>
              </SectionDiv>
            </>
          )}
        </>
      }
      open
    />
  );
};

export default React.memo(DataInspector);
