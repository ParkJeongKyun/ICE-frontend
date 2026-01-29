'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext';
import { useRefs } from '@/contexts/RefContext';
import Collapse from '@/components/common/Collapse';
import Tooltip from '@/components/common/Tooltip';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  ThumbDiv,
  Thumbnail,
  NoDataMessage,
} from '../index.styles';
import type { ExifRow } from '@/types';

const ExifTagsCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const { searcherRef } = useRefs();

  const tagInfos = activeData?.hasExif ? activeData?.exifInfo?.tagInfos : null;
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
      const tagKey = `exifExamples.${tag}`;
      if (t.has(tagKey)) {
        const examples = t.raw(tagKey);
        if (examples && typeof examples === 'object' && rawData in examples) {
          return (examples as Record<string, string>)[rawData];
        }
      }
      return rawData;
    },
    [t]
  );

  const onJumpToAbsoluteOffset = useCallback(
    async (relativeOffset: number, length: number, tag: string) => {
      if (!searcherRef?.current) return;

      const absoluteOffset =
        tag === 'ExifOffset' ? baseOffset : baseOffset + (relativeOffset || 0);

      if (absoluteOffset < 0 || absoluteOffset >= fileSize) return;

      const hexStr = absoluteOffset.toString(16);
      try {
        await searcherRef.current.findByOffset(hexStr, length);
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
          const hexStr = entryValueAddress.toString(16);
          await searcherRef.current.findByOffset(hexStr, item.length);
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

        const hexStr = realDataAddress.toString(16);
        await searcherRef.current.findByOffset(hexStr, item.length);
      } catch (e) {
        // ignore
      }
    },
    [searcherRef, activeData, baseOffset]
  );
  const hasData = tagInfos && tagInfos.length > 0;

  return (
    <Collapse
      title={t('exifViewer.exifTags')}
      children={
        hasData ? (
          <>
            {tagInfos.map((item, index) => {
              const { name, description } = getExifTagLabel(item.tag);
              const displayData = getExifDataDisplay(item.tag, item.data);

              return (
                <ContentDiv key={`${index}-info`}>
                  <CellHeaderDiv>
                    <Tooltip text={description}>{name}</Tooltip>
                    {(() => {
                      const abs = baseOffset + (item.offset || 0);
                      const absValid =
                        typeof abs === 'number' && abs >= 0 && abs < fileSize;
                      const absHex =
                        typeof abs === 'number'
                          ? `0x${abs.toString(16).toUpperCase()}`
                          : '-';
                      const headerTooltip = absValid
                        ? `${t('exifViewer.jumpToTag')} ${absHex} (${abs})`
                        : t('exifViewer.jumpUnavailable');

                      return (
                        <Tooltip text={headerTooltip}>
                          <JumpButton
                            onClick={() =>
                              onJumpToAbsoluteOffset(
                                item?.offset ?? 0,
                                item?.length ?? 0,
                                item.tag
                              )
                            }
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
                      const entryHex = `0x${entryAddr.toString(16).toUpperCase()}`;
                      const realTooltip = item.isFar
                        ? `${t('exifViewer.jumpToPointerTarget')} ${entryHex} (${entryAddr})`
                        : `${t('exifViewer.jumpToData')} ${entryHex} (${entryAddr})`;

                      return (
                        <Tooltip text={realTooltip}>
                          <JumpButton
                            onClick={() => onJumpToRealDataOffset(item)}
                          >
                            <ChevronRightIcon />
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
