'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import {
  SubHeader,
  CellBodyDiv,
  CellHeaderDiv,
  ContentDiv,
} from '../../InfoCollapse.styles';

const PeSecurityTlsCollapse: React.FC = () => {
  const t = useTranslations();
  const { config } = useConfig();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData) return null;

  const renderStatus = (val: boolean) => (
    <span style={{ color: val ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
      {val ? 'Enabled' : 'Disabled'}
    </span>
  );

  return (
    <Collapse
      id="pe-security-tls"
      title={t('peInfo.groups.certificatesTls')}
      open
    >
      {peData.security && (
        <>
          <SubHeader>{t('peInfo.security')}</SubHeader>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.aslr')}</CellHeaderDiv>
            <CellBodyDiv>{renderStatus(peData.security.aslr)}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.dep')}</CellHeaderDiv>
            <CellBodyDiv>{renderStatus(peData.security.dep)}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.cfg')}</CellHeaderDiv>
            <CellBodyDiv>{renderStatus(peData.security.cfg)}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.seh')}</CellHeaderDiv>
            <CellBodyDiv>{renderStatus(peData.security.seh)}</CellBodyDiv>
          </ContentDiv>
        </>
      )}
      {peData.debug && peData.debug.pdbPath && (
        <>
          <SubHeader>{t('peInfo.debugInfo')}</SubHeader>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.pdbPath')}</CellHeaderDiv>
            <CellBodyDiv
              style={{
                wordBreak: 'break-all',
                fontSize: '11px',
                fontFamily: 'monospace',
                opacity: 0.9,
              }}
            >
              {peData.debug.pdbPath}
            </CellBodyDiv>
          </ContentDiv>
        </>
      )}
      {peData.tls && peData.tls.hasCallbacks && (
        <>
          <SubHeader>{t('peInfo.tls')}</SubHeader>
          <ContentDiv>
            <CellHeaderDiv style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              {t('peInfo.tlsCallbacks')} ({peData.tls.callbacks.length})
            </CellHeaderDiv>
            <CellBodyDiv>
              {peData.tls.callbacks.map((cb, idx) => (
                <div
                  key={idx}
                  style={{ fontFamily: 'monospace', fontSize: '11px' }}
                >
                  {cb}
                </div>
              ))}
            </CellBodyDiv>
          </ContentDiv>
        </>
      )}
      {peData.certificates && peData.certificates.length > 0 && (
        <>
          <SubHeader>{t('peInfo.certificates')}</SubHeader>
          {peData.certificates.map((cert, idx) => (
            <div
              key={idx}
              style={{
                marginBottom:
                  idx < peData.certificates!.length - 1 ? '16px' : '0',
                borderBottom:
                  idx < peData.certificates!.length - 1
                    ? '1px solid #333'
                    : 'none',
                paddingBottom:
                  idx < peData.certificates!.length - 1 ? '8px' : '0',
              }}
            >
              <ContentDiv>
                <CellHeaderDiv>{t('peInfo.certSubject')}</CellHeaderDiv>
                <CellBodyDiv
                  style={{ wordBreak: 'break-all', fontSize: '11px' }}
                >
                  {cert.subject}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('peInfo.certIssuer')}</CellHeaderDiv>
                <CellBodyDiv
                  style={{ wordBreak: 'break-all', fontSize: '11px' }}
                >
                  {cert.issuer}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('peInfo.certSerial')}</CellHeaderDiv>
                <CellBodyDiv
                  style={{ fontFamily: 'monospace', fontSize: '11px' }}
                >
                  {cert.serial}
                </CellBodyDiv>
              </ContentDiv>
              <ContentDiv>
                <CellHeaderDiv>{t('peInfo.certValidity')}</CellHeaderDiv>
                <CellBodyDiv style={{ fontSize: '11px' }}>
                  {cert.notBefore} ~ {cert.notAfter}
                </CellBodyDiv>
              </ContentDiv>
            </div>
          ))}
        </>
      )}
    </Collapse>
  );
};

export default React.memo(PeSecurityTlsCollapse);
