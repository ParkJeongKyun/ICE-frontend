'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import { CellBodyDiv } from '../../InfoCollapse.styles';

const PeAnomaliesCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.anomalies || peData.anomalies.length === 0) return null;

  return (
    <Collapse title={t('peInfo.anomalies')} open>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {peData.anomalies.map((anomaly, i) => (
          <div
            key={i}
            style={{
              padding: '8px',
              background: 'rgba(255, 0, 0, 0.1)',
              borderLeft: '4px solid #ff4d4f',
              borderRadius: '4px',
              fontSize: '12px',
              color: 'var(--main-color)',
            }}
          >
            ⚠️ {anomaly}
          </div>
        ))}
      </div>
    </Collapse>
  );
};

export default React.memo(PeAnomaliesCollapse);
