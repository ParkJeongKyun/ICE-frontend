'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import { SubHeader, CellBodyDiv, CellHeaderDiv, ContentDiv, JumpButton } from '../../InfoCollapse.styles';
import { formatOffset } from '@/utils/formatters';

const PeHeadersCollapse: React.FC = () => {
  const t = useTranslations();
  const { config } = useConfig();
  const { activeData } = useTab();
  const { searcherRef } = useRefs();
  const peData = activeData?.peData;

  const onJumpToOffset = async (offset: number, length: number = 1) => {
    if (!searcherRef?.current || offset < 0) return;
    try {
      await searcherRef.current.findByOffset(offset, length);
    } catch (e) {
      // ignore
    }
  };

  if (!peData) return null;

  return (
    <Collapse title={t('peInfo.groups.headers')}>
      {/* DOS Header */}
      <SubHeader>{t('peInfo.dosHeader')}</SubHeader>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.magic')}</CellHeaderDiv>
        <CellBodyDiv>{peData.dosHeader.magic}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>
          {t('peInfo.lfanew')}
          <JumpButton onClick={() => onJumpToOffset(peData.dosHeader.lfanew)}>
            <ChevronRightIcon width={12} height={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.dosHeader.lfanew, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>

      {/* File Header */}
      <SubHeader>{t('peInfo.fileHeader')}</SubHeader>
      <ContentDiv>
        <CellHeaderDiv>
          {t('peInfo.offset')}
          <JumpButton onClick={() => onJumpToOffset(peData.fileHeader.offset)}>
            <ChevronRightIcon width={12} height={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.fileHeader.offset, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.numberOfSections')}</CellHeaderDiv>
        <CellBodyDiv>{peData.fileHeader.numberOfSections}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.characteristics')}</CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.fileHeader.characteristics, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>

      {/* Optional Header */}
      {peData.optionalHeader && Object.keys(peData.optionalHeader).length > 0 && (
        <>
          <SubHeader>{t('peInfo.optionalHeader')}</SubHeader>
          {Object.keys(peData.optionalHeader).map((key) => (
            <ContentDiv key={key}>
              <CellHeaderDiv>{key}</CellHeaderDiv>
              <CellBodyDiv>
                {typeof peData.optionalHeader[key] === 'number'
                  ? `0x${peData.optionalHeader[key].toString(16)} (${peData.optionalHeader[key]})`
                  : String(peData.optionalHeader[key])}
              </CellBodyDiv>
            </ContentDiv>
          ))}
        </>
      )}
    </Collapse>
  );
};

export default React.memo(PeHeadersCollapse);
