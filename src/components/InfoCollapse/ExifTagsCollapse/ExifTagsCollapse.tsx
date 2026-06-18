'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import DoubleChevronsRightIcon from '@/components/common/Icons/DoubleChevronsRightIcon';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  ThumbDiv,
  Thumbnail,
  NoDataMessage,
} from '../InfoCollapse.styles';
import type { ExifRow } from '@/types';
import { formatOffset, getDate } from '@/utils/formatters';

const ExifTagsCollapse: React.FC = () => {
  const t = useTranslations();
  const { config } = useConfig();
  const { activeData } = useTab();
  const { searcherRef } = useRefs();

  const tagInfos = activeData?.exifInfo?.tagInfos;
  const thumbnail = activeData?.exifInfo?.thumbnail;
  const baseOffset = activeData?.exifInfo?.baseOffset ?? 0;
  const fileSize = activeData?.file?.size ?? 0;

  const getExifTagLabel = useCallback(
    (tagMeta: string): { name: string; description: string } => {
      const tagKey = `exifTags.${tagMeta}`;
      if (t.has(tagKey)) {
        const translation = t.raw(tagKey);
        if (
          translation &&
          typeof translation === 'object' &&
          'name' in translation
        ) {
          return translation as { name: string; description: string };
        }
      }
      return { name: tagMeta, description: '' };
    },
    [t]
  );

  const getExifDataDisplay = useCallback(
    (tag: string, rawData: string): string => {
      const dateTags = ['DateTime', 'DateTimeOriginal', 'DateTimeDigitized'];
      if (dateTags.includes(tag)) {
        let date = new Date(rawData);
        if (isNaN(date.getTime())) {
          const exifDateRegex =
            /^(\d{4}):(\d{2}):(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/;
          const match = rawData.match(exifDateRegex);

          if (match) {
            const year = match[1];
            const month = match[2];
            const day = match[3];
            const hours = match[4] || '00';
            const minutes = match[5] || '00';
            const seconds = match[6] || '00';

            const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            date = new Date(isoString);
          }
        }

        // 3. 유효한 날짜 객체가 만들어졌다면 포맷팅해서 반환
        if (!isNaN(date.getTime())) {
          return getDate(date, config.ui.dateFormat); // 기존 포맷팅 함수 사용
        }

        // 정규식도 안 통하는 쓰레기값(예: "0000:00:00")이면 원본 그대로 반환하도록 아래로 흘려보냄
      }

      // 날짜가 아니거나 변환에 실패한 경우 기존 로직 수행
      const tagKey = `exifExamples.${tag}`;
      if (t.has(tagKey)) {
        const examples = t.raw(tagKey);
        if (examples && typeof examples === 'object' && rawData in examples) {
          return (examples as Record<string, string>)[rawData];
        }
      }
      return rawData;
    },
    [t, config.ui.dateFormat]
  );

  const onJumpToAbsoluteOffset = useCallback(
    async (relativeOffset: number, length: number, tag: string) => {
      if (!searcherRef?.current) return;

      const absoluteOffset =
        tag === 'ExifOffset' ? baseOffset : baseOffset + (relativeOffset || 0);

      if (absoluteOffset < 0 || absoluteOffset >= fileSize) return;

      try {
        await searcherRef.current.findByOffset(absoluteOffset, length);
      } catch (e) {
        // ignore
      }
    },
    [searcherRef, baseOffset, fileSize]
  );

  const onJumpToRealDataOffset = useCallback(
    async (item: ExifRow) => {
      if (!searcherRef?.current || !activeData?.file) return;

      const entryOffset = item.offset ?? 0;
      const entryValueAddress = baseOffset + entryOffset;

      try {
        if (!item.isFar) {
          await searcherRef.current.findByOffset(
            entryValueAddress,
            item.length
          );
          return;
        }

        const file = activeData.file;
        if (entryValueAddress < 0 || entryValueAddress + 4 > file.size) return;

        const blob = file.slice(entryValueAddress, entryValueAddress + 4);
        const buffer = await blob.arrayBuffer();
        const dataView = new DataView(buffer);
        const isLittleEndian =
          activeData?.exifInfo?.byteOrder === 'LittleEndian' ||
          activeData?.exifInfo?.byteOrder === 'NativeEndian';
        const pointerValue = dataView.getUint32(0, isLittleEndian);
        const realDataAddress = baseOffset + pointerValue;

        if (realDataAddress < 0 || realDataAddress >= file.size) return;

        await searcherRef.current.findByOffset(realDataAddress, item.length);
      } catch (e) {
        // ignore
      }
    },
    [searcherRef, activeData, baseOffset]
  );
  const hasData = tagInfos && tagInfos.length > 0;

  return (
    <Collapse
      title={t('exifTagsInfo.title')}
      children={
        hasData ? (
          <>
            {tagInfos.map((item, index) => {
              const { name, description } = getExifTagLabel(item.tag);
              const displayData = getExifDataDisplay(item.tag, item.data);

              return (
                <ContentDiv key={`${index}-info`}>
                  <CellHeaderDiv>
                    <Tooltip text={`${item.tag}\n${description}`}>
                      {name}
                    </Tooltip>
                    {(() => {
                      const abs = baseOffset + (item.offset || 0);
                      const absValid =
                        typeof abs === 'number' && abs >= 0 && abs < fileSize;
                      const absStr = absValid
                        ? formatOffset(abs, config.ui.numberBase)
                        : '-';
                      const headerTooltip = absValid
                        ? t('exifTagsInfo.jumpToTag', {
                            target: absStr,
                            bytes: item.isFar ? 4 : item.length || 0,
                          })
                        : t('exifTagsInfo.jumpUnavailable');

                      return (
                        <Tooltip text={headerTooltip}>
                          <JumpButton
                            onClick={() =>
                              onJumpToAbsoluteOffset(
                                item?.offset ?? 0,
                                item.isFar ? 4 : (item?.length ?? 0),
                                item.tag
                              )
                            }
                            aria-label={headerTooltip}
                          >
                            <ChevronRightIcon />
                          </JumpButton>
                        </Tooltip>
                      );
                    })()}
                  </CellHeaderDiv>
                  <CellBodyDiv>
                    {thumbnail &&
                    (item.tag === 'JPEGInterchangeFormat' ||
                      item.tag === 'ThumbJPEGInterchangeFormat') ? (
                      <ThumbDiv>
                        <Thumbnail src={thumbnail} />
                      </ThumbDiv>
                    ) : (
                      <Tooltip text={item.data}>
                        <div>{displayData}</div>
                      </Tooltip>
                    )}
                    {(() => {
                      const entryOffset = item.offset ?? 0;
                      const entryAddr = baseOffset + entryOffset;
                      const entryStr = formatOffset(
                        entryAddr,
                        config.ui.numberBase
                      );
                      const realTooltip = item.isFar
                        ? t('exifTagsInfo.jumpToPointerTarget')
                        : t('exifTagsInfo.jumpToData', {
                            target: entryStr,
                            bytes: item.length || 0,
                          });

                      return (
                        <Tooltip text={realTooltip}>
                          <JumpButton
                            onClick={() => onJumpToRealDataOffset(item)}
                            aria-label={realTooltip}
                          >
                            {item.isFar ? (
                              <DoubleChevronsRightIcon />
                            ) : (
                              <ChevronRightIcon />
                            )}
                          </JumpButton>
                        </Tooltip>
                      );
                    })()}
                  </CellBodyDiv>
                </ContentDiv>
              );
            })}
          </>
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      open
    />
  );
};

export default React.memo(ExifTagsCollapse);
