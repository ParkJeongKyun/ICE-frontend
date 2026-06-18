'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import { NoDataMessage } from '../InfoCollapse.styles';
import PeBasicCollapse from './sub/PeBasicCollapse';
import PeDosHeaderCollapse from './sub/PeDosHeaderCollapse';
import PeFileHeaderCollapse from './sub/PeFileHeaderCollapse';
import PeOptionalHeaderCollapse from './sub/PeOptionalHeaderCollapse';
import PeRichHeaderCollapse from './sub/PeRichHeaderCollapse';
import PeSectionsCollapse from './sub/PeSectionsCollapse';
import PeDataDirectoriesCollapse from './sub/PeDataDirectoriesCollapse';
import PeImportsCollapse from './sub/PeImportsCollapse';
import PeExportsCollapse from './sub/PeExportsCollapse';
import PeAnomaliesCollapse from './sub/PeAnomaliesCollapse';
import PeDebugCollapse from './sub/PeDebugCollapse';
import PeSecurityCollapse from './sub/PeSecurityCollapse';
import PeCertificatesCollapse from './sub/PeCertificatesCollapse';
import PeVersionInfoCollapse from './sub/PeVersionInfoCollapse';
import PeTlsCollapse from './sub/PeTlsCollapse';
import PeHashesCollapse from './sub/PeHashesCollapse';

const PeInfoCollapse: React.FC = () => {
  const t = useTranslations();
  const { activeData } = useTab();
  const peData = activeData?.peData;

  if (!peData) {
    return (
      <Collapse
        title={t('peInfo.title')}
        children={<NoDataMessage>{t('common.noData')}</NoDataMessage>}
        open
      />
    );
  }

  return (
    <>
      {/* 1. Essential/Identification */}
      <PeBasicCollapse />
      <PeHashesCollapse />
      
      {/* 2. Headers */}
      <PeFileHeaderCollapse />
      <PeDosHeaderCollapse />
      <PeRichHeaderCollapse />
      <PeOptionalHeaderCollapse />
      
      {/* 3. Security/Debug/Metadata */}
      <PeSecurityCollapse />
      <PeDebugCollapse />
      <PeTlsCollapse />
      <PeCertificatesCollapse />
      <PeVersionInfoCollapse />
      
      {/* 4. Structure/Data */}
      <PeSectionsCollapse />
      <PeDataDirectoriesCollapse />
      <PeImportsCollapse />
      <PeExportsCollapse />
      
      {/* 5. Alerts */}
      <PeAnomaliesCollapse />
    </>
  );
};

export default React.memo(PeInfoCollapse);
