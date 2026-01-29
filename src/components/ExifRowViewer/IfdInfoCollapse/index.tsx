'use client';

import React, { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext';
import { useRefs } from '@/contexts/RefContext';
import Collapse from '@/components/common/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
  NoDataMessage,
} from '../index.styles';

const IfdInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const { searcherRef } = useRefs();
  const baseOffset = activeData?.exifInfo?.baseOffset;

  const ifdInfos = useMemo(() => {
    if (!activeData?.hasExif) return [];
    const infos = activeData?.exifInfo?.ifdInfos ?? [];
    return [...infos].sort((a, b) => {
      const ao = Number(a.offset ?? 0);
      const bo = Number(b.offset ?? 0);
      if (ao !== bo) return ao - bo;
      const an = String(a.ifdName ?? '');
      const bn = String(b.ifdName ?? '');
      return an.localeCompare(bn);
    });
  }, [activeData?.exifInfo?.ifdInfos, activeData?.hasExif]);

  const onJumpToIfdOffset = useCallback(
    async (ifdOffset?: number) => {
      if (!searcherRef?.current || ifdOffset === undefined || !activeData?.file)
        return;
      const absolute = Number(baseOffset ?? 0) + Number(ifdOffset || 0);
      if (
        Number.isNaN(absolute) ||
        absolute < 0 ||
        absolute >= activeData.file.size
      )
        return;

      const hexStr = absolute.toString(16);
      try {
        await searcherRef.current.findByOffset(hexStr, 0);
      } catch (e) {
        // ignore
      }
    },
    [searcherRef, baseOffset, activeData]
  );
  const hasData = ifdInfos && ifdInfos.length > 0;

  return (
    <Collapse
      title={t('exifViewer.ifdInfo')}
      children={
        hasData ? (
          <>
            {ifdInfos.map((ifd, i) => (
              <Collapse
                key={`${ifd.ifdName || 'ifd'}-${i}`}
                title={`${ifd.ifdName}${ifd.tagCount ? ` (${ifd.tagCount})` : ''}`}
                children={
                  <>
                    <ContentDiv>
                      <CellHeaderDiv>{t('exifViewer.ifdOffset')}</CellHeaderDiv>
                      <CellBodyDiv>
                        <span>{ifd.offset}</span>
                        <JumpButton
                          onClick={() => onJumpToIfdOffset(ifd.offset)}
                        >
                          <ChevronRightIcon />
                        </JumpButton>
                      </CellBodyDiv>
                    </ContentDiv>
                    <ContentDiv>
                      <CellHeaderDiv>
                        {t('exifViewer.ifdTagCount')}
                      </CellHeaderDiv>
                      <CellBodyDiv>{ifd.tagCount ?? '-'}</CellBodyDiv>
                    </ContentDiv>
                    <ContentDiv>
                      <CellHeaderDiv>
                        {t('exifViewer.ifdNextOffset')}
                      </CellHeaderDiv>
                      <CellBodyDiv>{ifd.nextIfdOffset ?? '-'}</CellBodyDiv>
                    </ContentDiv>
                  </>
                }
              />
            ))}
          </>
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      open
    />
  );
};

export default React.memo(IfdInfoCollapse);
