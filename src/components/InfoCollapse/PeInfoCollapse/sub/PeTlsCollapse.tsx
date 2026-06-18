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

const PeTlsCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.tls || !peData.tls.hasCallbacks) return null;

  return (
    <Collapse title={t('peInfo.tls')} open>
      <ContentDiv>
        <CellHeaderDiv style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          {t('peInfo.tlsCallbacks')} ({peData.tls.callbacks.length})
        </CellHeaderDiv>
        <CellBodyDiv>
          {peData.tls.callbacks.map((cb, idx) => (
            <div key={idx} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {cb}
            </div>
          ))}
        </CellBodyDiv>
      </ContentDiv>
    </Collapse>
  );
};

export default React.memo(PeTlsCollapse);
