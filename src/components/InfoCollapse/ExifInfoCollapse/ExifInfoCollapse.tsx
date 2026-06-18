'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  NoDataMessage,
} from '../InfoCollapse.styles';
import { formatOffset } from '@/utils/formatters';

const ExifInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { config } = useConfig();
  const { activeData } = useTab();
  const { searcherRef } = useRefs();
  const exifInfo = activeData?.exifInfo;
  const baseOffset = activeData?.exifInfo?.baseOffset;

  const getByteOrderLabel = useCallback(
    (byteOrder?: string): string => {
      if (!byteOrder) return '-';
      switch (byteOrder) {
        case 'LittleEndian':
          return t('exifInfo.littleEndian');
        case 'BigEndian':
          return t('exifInfo.bigEndian');
        case 'NativeEndian':
          return t('exifInfo.nativeEndian');
        default:
          return byteOrder;
      }
    },
    [t]
  );

  const onJumpToBaseOffset = useCallback(
    async (isByteOrder: boolean = false) => {
      if (
        !searcherRef?.current ||
        !activeData?.file ||
        baseOffset === undefined
      )
        return;
      const absolute = Number(baseOffset);
      const length = isByteOrder ? 2 : 1;
      if (
        Number.isNaN(absolute) ||
        absolute < 0 ||
        absolute + length > activeData.file.size
      )
        return;

      try {
        await searcherRef.current.findByOffset(absolute, length);
      } catch (e) {
        // ignore
      }
    },
    [searcherRef, baseOffset, activeData]
  );

  const onJumpToFirstIfdOffset = useCallback(async () => {
    if (!searcherRef?.current || !activeData?.file) return;
    const rel = Number(activeData?.exifInfo?.firstIfdOffset ?? NaN);
    const base = Number(baseOffset ?? NaN);
    if (Number.isNaN(rel) || Number.isNaN(base)) return;

    const absolute = base + rel;
    if (absolute < 0 || absolute >= activeData.file.size) return;

    try {
      await searcherRef.current.findByOffset(absolute, 0);
    } catch (e) {
      // ignore
    }
  }, [searcherRef, baseOffset, activeData]);

  const onJumpToEndOffset = useCallback(async () => {
    if (!searcherRef?.current || !activeData?.file) return;
    const endOffset = Number(activeData?.exifInfo?.endOffset ?? NaN);
    if (
      Number.isNaN(endOffset) ||
      endOffset < 0 ||
      endOffset >= activeData.file.size
    )
      return;

    try {
      await searcherRef.current.findByOffset(endOffset, 0);
    } catch (e) {
      // ignore
    }
  }, [searcherRef, activeData]);

  return (
    <Collapse
      title={t('exifInfo.title')}
      children={
        exifInfo ? (
          <>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifInfo.byteOrder')}
                {typeof baseOffset === 'number' && (
                  <Tooltip
                    text={t('exifInfo.jumpToOffset', {
                      target: formatOffset(
                        Number(baseOffset),
                        config.ui.numberBase
                      ),
                      bytes: 2,
                    })}
                  >
                    <JumpButton
                      onClick={() => onJumpToBaseOffset(true)}
                      aria-label={t('exifInfo.jumpToOffset', {
                        target: formatOffset(
                          Number(baseOffset),
                          config.ui.numberBase
                        ),
                        bytes: 2,
                      })}
                    >
                      <ChevronRightIcon />
                    </JumpButton>
                  </Tooltip>
                )}
              </CellHeaderDiv>
              <CellBodyDiv>{getByteOrderLabel(exifInfo.byteOrder)}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifInfo.baseOffset')}
                {typeof baseOffset === 'number' && (
                  <Tooltip
                    text={t('exifInfo.jumpToOffset', {
                      target: formatOffset(
                        Number(baseOffset),
                        config.ui.numberBase
                      ),
                      bytes: 1,
                    })}
                  >
                    <JumpButton
                      onClick={() => onJumpToBaseOffset(false)}
                      aria-label={t('exifInfo.jumpToOffset', {
                        target: formatOffset(
                          Number(baseOffset),
                          config.ui.numberBase
                        ),
                        bytes: 1,
                      })}
                    >
                      <ChevronRightIcon />
                    </JumpButton>
                  </Tooltip>
                )}
              </CellHeaderDiv>
              <CellBodyDiv>{exifInfo.baseOffset ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifInfo.endOffset')}
                {typeof exifInfo.endOffset === 'number' && (
                  <Tooltip
                    text={t('exifInfo.jumpToOffset', {
                      target: formatOffset(
                        Number(exifInfo.endOffset),
                        config.ui.numberBase
                      ),
                      bytes: 1,
                    })}
                  >
                    <JumpButton
                      onClick={onJumpToEndOffset}
                      aria-label={t('exifInfo.jumpToOffset', {
                        target: formatOffset(
                          Number(exifInfo.endOffset),
                          config.ui.numberBase
                        ),
                        bytes: 1,
                      })}
                    >
                      <ChevronRightIcon />
                    </JumpButton>
                  </Tooltip>
                )}
              </CellHeaderDiv>
              <CellBodyDiv>{exifInfo.endOffset ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('exifInfo.dataSize')}</CellHeaderDiv>
              <CellBodyDiv>{exifInfo.dataSize ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifInfo.firstIfdOffset')}
                {typeof exifInfo.firstIfdOffset === 'number' && (
                  <Tooltip
                    text={t('exifInfo.jumpToOffset', {
                      target: formatOffset(
                        Number(baseOffset) + Number(exifInfo.firstIfdOffset),
                        config.ui.numberBase
                      ),
                      bytes: 1,
                    })}
                  >
                    <JumpButton
                      onClick={onJumpToFirstIfdOffset}
                      aria-label={t('exifInfo.jumpToOffset', {
                        target: formatOffset(
                          Number(baseOffset) + Number(exifInfo.firstIfdOffset),
                          config.ui.numberBase
                        ),
                        bytes: 1,
                      })}
                    >
                      <ChevronRightIcon />
                    </JumpButton>
                  </Tooltip>
                )}
              </CellHeaderDiv>
              <CellBodyDiv>{exifInfo.firstIfdOffset ?? '-'}</CellBodyDiv>
            </ContentDiv>
          </>
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      open
    />
  );
};

export default React.memo(ExifInfoCollapse);
