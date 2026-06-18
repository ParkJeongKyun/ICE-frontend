'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
} from '../../InfoCollapse.styles';

const PeSecurityCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  const renderStatus = (val: boolean) => (
    <span style={{ color: val ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
      {val ? 'Enabled' : 'Disabled'}
    </span>
  );

  if (!peData || !peData.security) return null;

  const { aslr, dep, cfg, seh } = peData.security;

  return (
    <Collapse title={t('peInfo.security')} open>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.aslr')}</CellHeaderDiv>
        <CellBodyDiv>{renderStatus(aslr)}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.dep')}</CellHeaderDiv>
        <CellBodyDiv>{renderStatus(dep)}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.cfg')}</CellHeaderDiv>
        <CellBodyDiv>{renderStatus(cfg)}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.seh')}</CellHeaderDiv>
        <CellBodyDiv>{renderStatus(seh)}</CellBodyDiv>
      </ContentDiv>
    </Collapse>
  );
};

export default React.memo(PeSecurityCollapse);
