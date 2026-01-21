import Collapse from '@/components/common/Collapse';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import { isValidLocation } from '@/utils/getAddress';
import LeafletMap from '@/components/LeafletMap';
import Tooltip from '@/components/common/Tooltip';
import { useTab } from '@/contexts/TabDataContext';
import { getBytes, getDate } from '@/utils/exifParser';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '../common/Icons/ChevronRightIcon';
import { useRefs } from '@/contexts/RefContext';
import { ExifRow } from '@/types';

const ExifRowViewer: React.FC = () => {
  const { activeData } = useTab();
  const { t } = useTranslation();
  const { searcherRef } = useRefs();
  const fileSize = activeData?.file?.size ?? 0;
  const thumbnail = activeData?.thumbnail;
  const baseOffset = activeData?.baseOffset;

  const getExifTagLabel = useCallback((tagMeta: string): { name: string; description: string } => {
    const tagKey = `${tagMeta}`;
    const translation = t(tagKey, { ns: 'exifTags', returnObjects: true });
    if (translation && typeof translation === 'object' && 'name' in translation) {
      return translation as { name: string; description: string };
    }

    return { name: tagMeta, description: '' };
  }, [t]);

  const getExifDataDisplay = useCallback((tag: string, rawData: string): string => {
    const examples = t(tag, { ns: 'exifExamples', returnObjects: true });
    if (examples && typeof examples === 'object' && rawData in examples) {
      return (examples as Record<string, string>)[rawData];
    }
    return rawData;
  }, [t]);


  const handleJumpToAbsoluteOffset = useCallback(
    async (relativeOffset: number, length: number, tag: string) => {
      if (!searcherRef?.current) return;

      const absoluteOffset = tag === 'ExifOffset' ? baseOffset : baseOffset + (relativeOffset || 0);

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

  const handleJumpToRealDataOffset = useCallback(
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
        const pointerValue = dataView.getUint32(0, true);
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

  return (
    <ViewerDiv>
      {thumbnail && (
        <Collapse
          title={t('exifViewer.thumbnail')}
          children={
            <>
              <ThumbDiv>
                <Thumbnail src={thumbnail} />
              </ThumbDiv>
            </>
          }
          open
        />
      )}
      {activeData?.fileinfo && (
        <Collapse
          title={t('exifViewer.fileInfo')}
          children={
            <>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.fileName')}</CellHeaderDiv>
                <CellBodyDiv>{activeData.fileinfo.name}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.lastModified')}</CellHeaderDiv>
                <CellBodyDiv>
                  {getDate(activeData.fileinfo.lastModified)}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.size')}</CellHeaderDiv>
                <CellBodyDiv>{getBytes(activeData.fileinfo.size)}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('exifViewer.mimeTypeMessage')}>
                    {t('exifViewer.mimeType')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.mime_type || '-'}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('exifViewer.appropriateExtensionMessage')}>
                    {t('exifViewer.appropriateExtension')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileinfo.extension || '-'}
                </CellBodyDiv>
              </ContentDiv>
            </>
          }
          open
        />
      )}
      {
        isValidLocation(activeData?.location.lat, activeData?.location.lng) && (
          <Collapse
            title={t('exifViewer.map')}
            children={
              <>
                <LeafletMap
                  latitude={activeData?.location.lat || ''}
                  longitude={activeData?.location.lng || ''}
                />
              </>
            }
            open
            removePadding
          />
        )}
      {activeData?.rows && activeData.rows.length > 0 && (
        <Collapse
          title={t('exifViewer.exifData')}
          children={
            <>
              {activeData.rows.map((item, index) => {
                const { name, description } = getExifTagLabel(item.tag);
                const displayData = getExifDataDisplay(item.tag, item.data);

                return (
                  <ContentDiv key={`${index}-info`}>
                    <CellHeaderDiv>
                      <Tooltip text={description}>
                        {name}
                      </Tooltip>
                      {(() => {
                        const abs = item.tag === 'ExifOffset' ? baseOffset : baseOffset + (item.offset || 0);
                        const absValid = typeof abs === 'number' && abs >= 0 && abs < fileSize;
                        const absHex = typeof abs === 'number' ? `0x${abs.toString(16).toUpperCase()}` : '-';
                        const headerTooltip = absValid
                          ? `${t('exifViewer.jumpToTag')} ${absHex} (${abs})`
                          : t('exifViewer.jumpUnavailable');

                        return (
                          <Tooltip text={headerTooltip}>
                            <JumpButton onClick={() => handleJumpToAbsoluteOffset(item?.offset, item?.length, item.tag)}>
                              <ChevronRightIcon />
                            </JumpButton>
                          </Tooltip>
                        );
                      })()}
                    </CellHeaderDiv>
                    <CellBodyDiv>

                      {thumbnail && (item.tag === 'JPEGInterchangeFormat' || item.tag === 'ThumbJPEGInterchangeFormat') ? (
                        <ThumbDiv>
                          <Thumbnail src={thumbnail} />
                        </ThumbDiv>
                      ) : (
                        <Tooltip text={item.data}>
                          <div>
                            {displayData}
                          </div>
                        </Tooltip>
                      )
                      }
                      {item.tag !== "ExifOffset" && (() => {
                        const entryOffset = item.offset ?? 0;
                        const entryAddr = baseOffset + entryOffset;
                        const entryHex = `0x${entryAddr.toString(16).toUpperCase()}`;
                        const realTooltip = item.isFar
                          ? `${t('exifViewer.jumpToPointerTarget')} ${entryHex} (${entryAddr})`
                          : `${t('exifViewer.jumpToData')} ${entryHex} (${entryAddr})`;

                        return (
                          <Tooltip text={realTooltip}>
                            <JumpButton
                              style={{ marginLeft: '8px', opacity: 0.7 }}
                              onClick={() => handleJumpToRealDataOffset(item)}
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
          }
          open
        />
      )}
    </ViewerDiv>
  );
};

export default React.memo(ExifRowViewer);
