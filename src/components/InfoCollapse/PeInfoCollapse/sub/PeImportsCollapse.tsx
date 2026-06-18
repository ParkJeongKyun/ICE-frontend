'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';

const PeImportsCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.imports || peData.imports.length === 0) return null;

  return (
    <Collapse title={t('peInfo.imports')}>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid var(--main-line-color)',
          borderRadius: '4px',
          padding: '4px',
        }}
      >
        {peData.imports.map((lib, i) => (
          <div
            key={i}
            style={{
              marginBottom: '8px',
              padding: '6px',
              background: 'var(--main-hover-color)',
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'var(--ice-main-color)',
                marginBottom: '4px',
              }}
            >
              {lib.library}
            </div>
            <div
              style={{
                fontSize: '10px',
                opacity: 0.9,
                color: 'var(--main-color)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
              }}
            >
              {lib.imports.map((imp, j) => (
                <span key={j} style={{ background: 'var(--main-bg-color)', padding: '1px 4px', borderRadius: '2px', border: '1px solid var(--main-line-color)' }}>
                  {imp.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Collapse>
  );
};

export default React.memo(PeImportsCollapse);
