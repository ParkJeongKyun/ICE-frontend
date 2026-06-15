'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import {
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
  NoDataMessage,
  SectionTable,
} from '../InfoCollapse.styles';

const PeInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  return (
    <Collapse
      title={t('peInfo.title')}
      children={
        peData ? (
          <>
            <ContentDiv>
              <CellHeaderDiv>{t('peInfo.machine')}</CellHeaderDiv>
              <CellBodyDiv>{peData.machine}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('peInfo.timeDateStamp')}</CellHeaderDiv>
              <CellBodyDiv>{peData.timeDateStamp}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('peInfo.numberOfSections')}</CellHeaderDiv>
              <CellBodyDiv>{peData.numberOfSections}</CellBodyDiv>
            </ContentDiv>
            <ContentDiv>
              <CellHeaderDiv>{t('peInfo.characteristics')}</CellHeaderDiv>
              <CellBodyDiv>
                0x{peData.characteristics.toString(16).toUpperCase()}
              </CellBodyDiv>
            </ContentDiv>

            <div style={{ marginTop: '16px' }}>
              <CellHeaderDiv>{t('peInfo.sections')}</CellHeaderDiv>
              <SectionTable>
                <thead>
                  <tr>
                    <th>{t('peInfo.sectionName')}</th>
                    <th>{t('peInfo.virtualSize')}</th>
                    <th>{t('peInfo.rawSize')}</th>
                  </tr>
                </thead>
                <tbody>
                  {peData.sections.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>0x{s.virtualSize.toString(16).toUpperCase()}</td>
                      <td>0x{s.sizeOfRawData.toString(16).toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </SectionTable>
            </div>
          </>
        ) : (
          <NoDataMessage>{t('common.noData')}</NoDataMessage>
        )
      }
      open
    />
  );
};

export default React.memo(PeInfoCollapse);
