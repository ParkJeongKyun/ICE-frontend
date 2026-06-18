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

const PeDataDirectoriesCollapse: React.FC = () => {
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

  if (!peData || !peData.dataDirectories || peData.dataDirectories.length === 0) return null;

  return (
    <Collapse title={t('peInfo.dataDirectories')}>
      <SectionTable>
        <thead>
          <tr>
            <th>{t('peInfo.sectionName')}</th>
            <th>V.Address</th>
            <th>{t('peInfo.offset')}</th>
            <th>{t('peInfo.rawSize')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {peData.dataDirectories.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>0x{d.virtualAddress.toString(16)}</td>
              <td>{formatOffset(d.fileOffset, config.ui.numberBase)}</td>
              <td>{formatOffset(d.size, config.ui.numberBase)}</td>
              <td>
                <JumpButton onClick={() => onJumpToOffset(d.fileOffset)}>
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

export default React.memo(PeDataDirectoriesCollapse);
