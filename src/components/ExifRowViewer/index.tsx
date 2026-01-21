import Collapse from '@/components/common/Collapse';
import React, { useCallback, useMemo } from 'react';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  ThumbDiv,
  Thumbnail,
  ViewerDiv,
} from './index.styles';
import Tooltip from '@/components/common/Tooltip';
import { useTab } from '@/contexts/TabDataContext';
import { getBytes, getDate } from '@/utils/exifParser';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '../common/Icons/ChevronRightIcon';
import { useRefs } from '@/contexts/RefContext';
import { ExifRow } from '@/types';
import { isValidLocation } from '@/utils/getAddress';
import LeafletMap from '@/components/LeafletMap';

const ExifRowViewer: React.FC = () => {
  const { activeData } = useTab();
  const { t } = useTranslation();
  const { searcherRef } = useRefs();
  const fileSize = activeData?.file?.size ?? 0;
  const thumbnail = activeData?.exifInfo?.thumbnail;
  const baseOffset = activeData?.exifInfo?.baseOffset;

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

  const sortedIfdInfos = useMemo(() => {
    const infos = activeData?.exifInfo?.ifdInfos ?? [];
    return [...infos].sort((a, b) => {
      const ao = Number(a.offset ?? 0);
      const bo = Number(b.offset ?? 0);
      if (ao !== bo) return ao - bo;
      const an = String(a.ifdName ?? '');
      const bn = String(b.ifdName ?? '');
      return an.localeCompare(bn);
    });
  }, [activeData?.exifInfo?.ifdInfos]);


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

  const handleJumpToIfdOffset = useCallback(
    async (ifdOffset?: number) => {
      if (!searcherRef?.current || ifdOffset === undefined || !activeData?.file) return;
      const absolute = baseOffset + (ifdOffset || 0);
      if (absolute < 0 || absolute >= activeData.file.size) return;

      const hexStr = absolute.toString(16);
      try {
        await searcherRef.current.findByOffset(hexStr, 0);
      } catch (e) {
        // ignore
      }
    },
    [searcherRef, baseOffset, activeData]
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
      {activeData?.fileInfo && (
        <Collapse
          title={t('exifViewer.fileInfo')}
          children={
            <>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.fileName')}</CellHeaderDiv>
                <CellBodyDiv>{activeData.fileInfo.name}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.lastModified')}</CellHeaderDiv>
                <CellBodyDiv>
                  {getDate(activeData.fileInfo.lastModified)}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('exifViewer.size')}</CellHeaderDiv>
                <CellBodyDiv>{getBytes(activeData.fileInfo.size)}</CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('exifViewer.mimeTypeMessage')}>
                    {t('exifViewer.mimeType')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileInfo.mimeType || '-'}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>
                  <Tooltip text={t('exifViewer.appropriateExtensionMessage')}>
                    {t('exifViewer.appropriateExtension')}
                  </Tooltip>
                </CellHeaderDiv>
                <CellBodyDiv>
                  {activeData.fileInfo.extension || '-'}
                </CellBodyDiv>
              </ContentDiv>
            </>
          }
          open
        />
      )}
      {activeData?.hasExif && (
        <>
          {
            isValidLocation(activeData?.exifInfo.location.lat, activeData?.exifInfo.location.lng) && (
              <Collapse
                title={t('exifViewer.map')}
                children={
                  <>
                    <LeafletMap
                      latitude={activeData?.exifInfo.location.lat || ''}
                      longitude={activeData?.exifInfo.location.lng || ''}
                    />
                  </>
                }
                open
                removePadding
              />
            )}

          <Collapse
            title={t('exifViewer.exifInfo')}
            children={
              <>
                <ContentDiv>
                  <CellHeaderDiv>{t('exifViewer.byteOrder')}</CellHeaderDiv>
                  <CellBodyDiv>{activeData.exifInfo?.byteOrder || '-'}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>{t('exifViewer.baseOffset')}</CellHeaderDiv>
                  <CellBodyDiv>{activeData.exifInfo?.baseOffset ?? '-'}</CellBodyDiv>
                </ContentDiv>
                <ContentDiv>
                  <CellHeaderDiv>{t('exifViewer.firstIfdOffset')}</CellHeaderDiv>
                  <CellBodyDiv>{activeData.exifInfo?.firstIfdOffset ?? '-'}</CellBodyDiv>
                </ContentDiv>
              </>
            }
            open
          />

          {sortedIfdInfos && sortedIfdInfos.length > 0 && (
            <Collapse
              title={t('exifViewer.ifdInfo')}
              children={
                <>
                  {sortedIfdInfos.map((ifd, i) => (
                    <Collapse
                      key={`${ifd.ifdName || 'ifd'}-${i}`}
                      title={`${ifd.ifdName}${ifd.tagCount ? ` (${ifd.tagCount})` : ''}`}
                      children={
                        <>
                          <ContentDiv>
                            <CellHeaderDiv>{t('exifViewer.ifdOffset')}</CellHeaderDiv>
                            <CellBodyDiv style={{ display: 'flex', alignItems: 'center' }}>
                              <span>{ifd.offset}</span>
                              <JumpButton style={{ marginLeft: 8 }} onClick={() => handleJumpToIfdOffset(ifd.offset)}>
                                <ChevronRightIcon />
                              </JumpButton>
                            </CellBodyDiv>
                          </ContentDiv>
                          <ContentDiv>
                            <CellHeaderDiv>{t('exifViewer.ifdTagCount')}</CellHeaderDiv>
                            <CellBodyDiv>{ifd.tagCount ?? '-'}</CellBodyDiv>
                          </ContentDiv>
                          <ContentDiv>
                            <CellHeaderDiv>{t('exifViewer.ifdNextOffset')}</CellHeaderDiv>
                            <CellBodyDiv>{ifd.nextIfdOffset ?? '-'}</CellBodyDiv>
                          </ContentDiv>
                        </>
                      }
                    />
                  ))}
                </>
              }
            />
          )}
          {activeData?.exifInfo?.tagInfos && activeData.exifInfo.tagInfos.length > 0 && (
            <Collapse
              title={t('exifViewer.exifTags')}
              children={
                <>
                  {activeData.exifInfo.tagInfos.map((item, index) => {
                    const { name, description } = getExifTagLabel(item.tag);
                    const displayData = getExifDataDisplay(item.tag, item.data);

                    return (
                      <ContentDiv key={`${index}-info`}>
                        <CellHeaderDiv>
                          <Tooltip text={description}>
                            {name}
                          </Tooltip>
                          {(() => {
                            const abs = baseOffset + (item.offset || 0);
                            const absValid = typeof abs === 'number' && abs >= 0 && abs < fileSize;
                            const absHex = typeof abs === 'number' ? `0x${abs.toString(16).toUpperCase()}` : '-';
                            const headerTooltip = absValid
                              ? `${t('exifViewer.jumpToTag')} ${absHex} (${abs})`
                              : t('exifViewer.jumpUnavailable');

                            return (
                              <Tooltip text={headerTooltip}>
                                <JumpButton onClick={() => handleJumpToAbsoluteOffset(item?.offset ?? 0, item?.length ?? 0, item.tag)}>
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
        </>
      )}
    </ViewerDiv>
  );
};

export default React.memo(ExifRowViewer);
