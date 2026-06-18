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

const PeCertificatesCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData || !peData.certificates || peData.certificates.length === 0) return null;

  return (
    <Collapse title={t('peInfo.certificates')} open>
      {peData.certificates.map((cert, idx) => (
        <div key={idx} style={{ 
          marginBottom: idx < peData.certificates.length - 1 ? '16px' : '0', 
          borderBottom: idx < peData.certificates.length - 1 ? '1px solid #333' : 'none', 
          paddingBottom: idx < peData.certificates.length - 1 ? '8px' : '0' 
        }}>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.certSubject')}</CellHeaderDiv>
            <CellBodyDiv style={{ wordBreak: 'break-all', fontSize: '11px' }}>{cert.subject}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.certIssuer')}</CellHeaderDiv>
            <CellBodyDiv style={{ wordBreak: 'break-all', fontSize: '11px' }}>{cert.issuer}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.certSerial')}</CellHeaderDiv>
            <CellBodyDiv style={{ fontFamily: 'monospace', fontSize: '11px' }}>{cert.serial}</CellBodyDiv>
          </ContentDiv>
          <ContentDiv>
            <CellHeaderDiv>{t('peInfo.certValidity')}</CellHeaderDiv>
            <CellBodyDiv style={{ fontSize: '11px' }}>
              {cert.notBefore} ~ {cert.notAfter}
            </CellBodyDiv>
          </ContentDiv>
        </div>
      ))}
    </Collapse>
  );
};

export default React.memo(PeCertificatesCollapse);
