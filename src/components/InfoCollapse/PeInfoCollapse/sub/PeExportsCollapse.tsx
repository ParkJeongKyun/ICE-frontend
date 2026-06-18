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

const PeExportsCollapse: React.FC = () => {
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

  if (!peData || !peData.exports || peData.exports.length === 0) return null;

  return (
    <Collapse title={t('peInfo.exports')}>
      <SectionTable>
        <thead>
          <tr>
            <th>{t('peInfo.sectionName')}</th>
            <th>{t('peInfo.address')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {peData.exports.map((e, i) => (
            <tr key={i}>
              <td>{e.name}</td>
              <td>{formatOffset(e.address, config.ui.numberBase)}</td>
              <td>
                <JumpButton onClick={() => onJumpToOffset(e.offset)}>
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

export default React.memo(PeExportsCollapse);
