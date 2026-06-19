'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import { SubHeader, CellBodyDiv, CellHeaderDiv, ContentDiv, JumpButton, SectionTable } from '../../InfoCollapse.styles';
import { formatOffset } from '@/utils/formatters';

const PeHeadersCollapse: React.FC = () => {
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
    <Collapse title={t('peInfo.groups.headers')}>
      {/* DOS Header */}
      <SubHeader>{t('peInfo.dosHeader')}</SubHeader>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.magic')}</CellHeaderDiv>
        <CellBodyDiv>{peData.dosHeader.magic}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>
          {t('peInfo.lfanew')}
          <JumpButton onClick={() => onJumpToOffset(peData.dosHeader.lfanew)}>
            <ChevronRightIcon width={12} height={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.dosHeader.lfanew, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>

      {/* File Header */}
      <SubHeader>{t('peInfo.fileHeader')}</SubHeader>
      <ContentDiv>
        <CellHeaderDiv>
          {t('peInfo.offset')}
          <JumpButton onClick={() => onJumpToOffset(peData.fileHeader.offset)}>
            <ChevronRightIcon width={12} height={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.fileHeader.offset, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.numberOfSections')}</CellHeaderDiv>
        <CellBodyDiv>{peData.fileHeader.numberOfSections}</CellBodyDiv>
      </ContentDiv>
      <ContentDiv>
        <CellHeaderDiv>{t('peInfo.characteristics')}</CellHeaderDiv>
        <CellBodyDiv>
          {formatOffset(peData.fileHeader.characteristics, config.ui.numberBase)}
        </CellBodyDiv>
      </ContentDiv>

      {/* Optional Header */}
      {peData.optionalHeader && Object.keys(peData.optionalHeader).length > 0 && (
        <>
          <SubHeader>{t('peInfo.optionalHeader')}</SubHeader>
          {Object.keys(peData.optionalHeader).map((key) => (
            <ContentDiv key={key}>
              <CellHeaderDiv>{key}</CellHeaderDiv>
              <CellBodyDiv>
                {typeof peData.optionalHeader[key] === 'number'
                  ? `0x${peData.optionalHeader[key].toString(16)} (${peData.optionalHeader[key]})`
                  : String(peData.optionalHeader[key])}
              </CellBodyDiv>
            </ContentDiv>
          ))}
        </>
      )}

      {/* Rich Header */}
      {peData.richHeader && peData.richHeader.items && peData.richHeader.items.length > 0 && (
        <>
          <SubHeader>{t('peInfo.richHeader')}</SubHeader>
          <div style={{ marginBottom: '8px', fontSize: '11px', opacity: 0.8 }}>
            Offset: 0x{peData.richHeader.offset.toString(16)}
            <JumpButton onClick={() => onJumpToOffset(peData.richHeader.offset)} style={{ marginLeft: '4px', display: 'inline-flex', verticalAlign: 'middle' }}>
              <ChevronRightIcon width={10} height={10} />
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
        </>
      )}
    </Collapse>
  );
};

export default React.memo(PeHeadersCollapse);
