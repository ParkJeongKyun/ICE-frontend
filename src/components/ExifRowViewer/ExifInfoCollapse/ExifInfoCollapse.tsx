'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
} from '../ExifRowViewer.styles';

const ExifInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const { searcherRef } = useRefs();
  const exifInfo = activeData?.hasExif ? activeData?.exifInfo : null;
  const baseOffset = activeData?.exifInfo?.baseOffset;
  const fileSize = activeData?.file?.size ?? 0;

  const getByteOrderLabel = useCallback(
    (byteOrder?: string): string => {
      if (!byteOrder) return '-';
      switch (byteOrder) {
        case 'LittleEndian':
          return t('exifViewer.littleEndian');
        case 'BigEndian':
          return t('exifViewer.bigEndian');
        case 'NativeEndian':
          return t('exifViewer.nativeEndian');
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

      const hexStr = absolute.toString(16);
      try {
        await searcherRef.current.findByOffset(hexStr, length);
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

    const hexStr = absolute.toString(16);
    try {
      await searcherRef.current.findByOffset(hexStr, 0);
    } catch (e) {
      // ignore
    }
  }, [searcherRef, baseOffset, activeData]);
  const hasData = !!exifInfo;

  return (
    <Collapse
      title={t('exifViewer.exifInfo')}
      children={
        exifInfo ? (
          <>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifViewer.byteOrder')}
                {typeof baseOffset === 'number' && (
                  <Tooltip
                    text={`${t('exifViewer.jumpToOffset')} 0x${Number(baseOffset).toString(16).toUpperCase()} (2 bytes)`}
                  >
                    <JumpButton onClick={() => onJumpToBaseOffset(true)}>
                      <ChevronRightIcon />
                    </JumpButton>
                  </Tooltip>
                )}
              </CellHeaderDiv>
              <CellBodyDiv>{getByteOrderLabel(exifInfo.byteOrder)}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifViewer.baseOffset')}
                {typeof baseOffset === 'number' && (
                  <Tooltip
                    text={`${t('exifViewer.jumpToOffset')} 0x${Number(baseOffset).toString(16).toUpperCase()}`}
                  >
                    <JumpButton onClick={() => onJumpToBaseOffset(false)}>
                      <ChevronRightIcon />
                    </JumpButton>
                  </Tooltip>
                )}
              </CellHeaderDiv>
              <CellBodyDiv>{exifInfo.baseOffset ?? '-'}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>
                {t('exifViewer.firstIfdOffset')}
                {typeof exifInfo.firstIfdOffset === 'number' && (
                  <Tooltip
                    text={`${t('exifViewer.jumpToOffset')} 0x${(Number(baseOffset) + Number(exifInfo.firstIfdOffset)).toString(16).toUpperCase()}`}
                  >
                    <JumpButton onClick={onJumpToFirstIfdOffset}>
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
