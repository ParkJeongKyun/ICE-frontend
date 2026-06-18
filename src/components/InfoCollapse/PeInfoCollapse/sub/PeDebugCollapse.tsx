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

const PeDebugCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.debug || !peData.debug.pdbPath) return null;

  return (
    <Collapse title={t('peInfo.debugInfo')}>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.pdbPath')}</CellHeaderDiv>
        <CellBodyDiv
          style={{
            wordBreak: 'break-all',
            fontSize: '11px',
            fontFamily: 'monospace',
            opacity: 0.9,
          }}
        >
          {peData.debug.pdbPath}
        </CellBodyDiv>
      </ContentDiv>
    </Collapse>
  );
};

export default React.memo(PeDebugCollapse);
