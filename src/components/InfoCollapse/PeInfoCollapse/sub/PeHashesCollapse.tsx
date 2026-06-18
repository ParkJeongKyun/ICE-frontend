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

const PeHashesCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.hashes) return null;

  const { impHash, authentihash } = peData.hashes;

  return (
    <Collapse title={t('peInfo.hashes')} open>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.impHash')}</CellHeaderDiv>
        <CellBodyDiv style={{ fontFamily: 'monospace', fontSize: '11px' }}>{impHash}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.authentihash')}</CellHeaderDiv>
        <CellBodyDiv style={{ fontFamily: 'monospace', fontSize: '11px' }}>{authentihash}</CellBodyDiv>
      </ContentDiv>
    </Collapse>
  );
};

export default React.memo(PeHashesCollapse);
