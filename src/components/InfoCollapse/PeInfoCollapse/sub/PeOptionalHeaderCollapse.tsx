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

const PeOptionalHeaderCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.optionalHeader || Object.keys(peData.optionalHeader).length === 0) {
    return null;
  }

  const keys = Object.keys(peData.optionalHeader);

  return (
    <Collapse title={t('peInfo.optionalHeader')}>
      {keys.map((key) => (
        <ContentDiv key={key}>
          <CellHeaderDiv>{key}</CellHeaderDiv>
          <CellBodyDiv>
            {typeof peData.optionalHeader[key] === 'number'
              ? `0x${peData.optionalHeader[key].toString(16)} (${peData.optionalHeader[key]})`
              : String(peData.optionalHeader[key])}
          </CellBodyDiv>
        </ContentDiv>
      ))}
    </Collapse>
  );
};

export default React.memo(PeOptionalHeaderCollapse);
