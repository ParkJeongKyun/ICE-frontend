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

const PeVersionInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.versionInfo || Object.keys(peData.versionInfo).length === 0) return null;

  return (
    <Collapse title={t('peInfo.versionInfo')} open>
      {Object.entries(peData.versionInfo).map(([key, value]) => (
        <ContentDiv key={key}>
          <CellHeaderDiv style={{ fontSize: '11px' }}>{key}</CellHeaderDiv>
          <CellBodyDiv style={{ wordBreak: 'break-all', fontSize: '11px' }}>{value}</CellBodyDiv>
        </ContentDiv>
      ))}
    </Collapse>
  );
};

export default React.memo(PeVersionInfoCollapse);
