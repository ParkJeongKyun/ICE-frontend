'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
} from '../../InfoCollapse.styles';
import { formatOffset } from '@/utils/formatters';

const PeDosHeaderCollapse: React.FC = () => {
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
    <Collapse title={t('peInfo.dosHeader')}>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.magic')}</CellHeaderDiv>
        <CellBodyDiv>{peData.dosHeader.magic}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>
          {t('peInfo.lfanew')}
          <JumpButton onClick={() => onJumpToOffset(peData.dosHeader.lfanew)}>
            <ChevronRightIcon size={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.dosHeader.lfanew, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>
    </Collapse>
  );
};

export default React.memo(PeDosHeaderCollapse);
