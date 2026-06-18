'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  JumpButton,
} from '../../InfoCollapse.styles';
import { formatOffset } from '@/utils/formatters';

const PeBasicCollapse: React.FC = () => {
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

  if (!peData) return null;

  return (
    <Collapse title={t('peInfo.basic')} open>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.magic')}</CellHeaderDiv>
        <CellBodyDiv>{peData.basic.magic}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.machine')}</CellHeaderDiv>
        <CellBodyDiv>{peData.basic.machine}</CellBodyDiv>
      </ContentDiv>
      {peData.basic.language && (
        <ContentDiv>
          <CellHeaderDiv>{t('peInfo.language')}</CellHeaderDiv>
          <CellBodyDiv>{peData.basic.language}</CellBodyDiv>
        </ContentDiv>
      )}
      {peData.basic.compiler && (
        <ContentDiv>
          <CellHeaderDiv>{t('peInfo.compiler')}</CellHeaderDiv>
          <CellBodyDiv>{peData.basic.compiler}</CellBodyDiv>
        </ContentDiv>
      )}
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.entropy')}</CellHeaderDiv>
        <CellBodyDiv>
          <span
            style={{
              color: peData.basic.totalEntropy > 7.0 ? '#ff4d4f' : 'inherit',
              fontWeight: peData.basic.totalEntropy > 7.0 ? 'bold' : 'normal',
            }}
          >
            {peData.basic.totalEntropy.toFixed(4)}
          </span>
        </CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.timeDateStamp')}</CellHeaderDiv>
        <CellBodyDiv>{peData.basic.timeDateStamp}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.imageBase')}</CellHeaderDiv>
        <CellBodyDiv>{peData.basic.imageBase}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>
          {t('peInfo.entryPoint')}
          <JumpButton
            onClick={() => onJumpToOffset(peData.basic.entryPointOffset)}
          >
            <ChevronRightIcon size={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {peData.basic.entryPoint} (Off:{' '}
          {formatOffset(peData.basic.entryPointOffset, config.ui.numberBase)})
        </CellBodyDiv>
      </ContentDiv>
    </Collapse>
  );
};

export default React.memo(PeBasicCollapse);
