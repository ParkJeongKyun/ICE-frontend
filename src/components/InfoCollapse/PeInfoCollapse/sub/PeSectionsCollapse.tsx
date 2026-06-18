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
import { formatOffset } from '@/utils/formatters';

const PeSectionsCollapse: React.FC = () => {
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

  if (!peData || !peData.sections || peData.sections.length === 0) return null;

  return (
    <Collapse title={t('peInfo.sections')}>
      <SectionTable>
        <thead>
          <tr>
            <th>{t('peInfo.sectionName')}</th>
            <th>{t('peInfo.entropy')}</th>
            <th>V.Address</th>
            <th>V.Size</th>
            <th>{t('peInfo.rawSize')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {peData.sections.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td
                style={{
                  color: s.entropy > 7.0 ? '#ff4d4f' : 'inherit',
                  fontWeight: s.entropy > 7.0 ? 'bold' : 'normal',
                }}
              >
                {s.entropy.toFixed(2)}
              </td>
              <td>0x{s.virtualAddress.toString(16)}</td>
              <td>0x{s.virtualSize.toString(16)}</td>
              <td>{formatOffset(s.sizeOfRawData, config.ui.numberBase)}</td>
              <td>
                <JumpButton onClick={() => onJumpToOffset(s.fileOffset)}>
                  <ChevronRightIcon size={12} />
                </JumpButton>
              </td>
            </tr>
          ))}
        </tbody>
      </SectionTable>
    </Collapse>
  );
};

export default React.memo(PeSectionsCollapse);
