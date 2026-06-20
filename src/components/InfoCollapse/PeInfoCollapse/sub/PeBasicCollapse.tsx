'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import { SubHeader, CellBodyDiv, CellHeaderDiv, ContentDiv, JumpButton } from '../../InfoCollapse.styles';
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
    <Collapse id="pe-basic" title={t('peInfo.groups.basic')} open>
      {/* Basic Content */}
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
            <ChevronRightIcon width={12} height={12} />
          </JumpButton>
        </CellHeaderDiv>
        <CellBodyDiv>
          {peData.basic.entryPoint} (Off:{' '}
          {formatOffset(peData.basic.entryPointOffset, config.ui.numberBase)})
        </CellBodyDiv>
      </ContentDiv>

      {/* Hashes Content */}
      {peData.hashes && (
        <>
          <SubHeader>{t('peInfo.hashes')}</SubHeader>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.impHash')}</CellHeaderDiv>
            <CellBodyDiv style={{ fontFamily: 'monospace', fontSize: '11px' }}>{peData.hashes.impHash}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.authentihash')}</CellHeaderDiv>
            <CellBodyDiv style={{ fontFamily: 'monospace', fontSize: '11px' }}>{peData.hashes.authentihash}</CellBodyDiv>
          </ContentDiv>
        </>
      )}

      {/* VersionInfo Content */}
      {peData.versionInfo && Object.keys(peData.versionInfo).length > 0 && (
        <>
          <SubHeader>{t('peInfo.versionInfo')}</SubHeader>
          {Object.entries(peData.versionInfo).map(([key, value]) => (
            <ContentDiv key={key}>
              <CellHeaderDiv style={{ fontSize: '11px' }}>{key}</CellHeaderDiv>
              <CellBodyDiv style={{ wordBreak: 'break-all', fontSize: '11px' }}>{value}</CellBodyDiv>
            </ContentDiv>
          ))}
        </>
      )}

      {/* Anomalies Content */}
      {peData.anomalies && peData.anomalies.length > 0 && (
        <>
          <SubHeader>{t('peInfo.anomalies')}</SubHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {peData.anomalies.map((anomaly, i) => (
              <div
                key={i}
                style={{
                  padding: '8px',
                  background: 'rgba(255, 0, 0, 0.1)',
                  borderLeft: '4px solid #ff4d4f',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: 'var(--main-color)',
                }}
              >
                ⚠️ {anomaly}
              </div>
            ))}
          </div>
        </>
      )}
    </Collapse>
  );
};

export default React.memo(PeBasicCollapse);
