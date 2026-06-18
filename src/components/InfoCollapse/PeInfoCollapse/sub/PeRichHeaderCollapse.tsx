'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import {
  SectionTable,
  JumpButton,
} from '../../InfoCollapse.styles';

const PeRichHeaderCollapse: React.FC = () => {
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

  if (!peData || !peData.richHeader || !peData.richHeader.items || peData.richHeader.items.length === 0) {
    return null;
  }

  return (
    <Collapse title={t('peInfo.richHeader')}>
      <div style={{ marginBottom: '8px', fontSize: '11px', opacity: 0.8 }}>
        Offset: 0x{peData.richHeader.offset.toString(16)}
        <JumpButton onClick={() => onJumpToOffset(peData.richHeader.offset)} style={{ marginLeft: '4px' }}>
          <ChevronRightIcon size={10} />
        </JumpButton>
      </div>
      <SectionTable>
        <thead>
          <tr>
            <th>Prod ID</th>
            <th>Version</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {peData.richHeader.items.map((item, i) => (
            <tr key={i}>
              <td>{item.id}</td>
              <td>{item.version}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </SectionTable>
    </Collapse>
  );
};

export default React.memo(PeRichHeaderCollapse);
