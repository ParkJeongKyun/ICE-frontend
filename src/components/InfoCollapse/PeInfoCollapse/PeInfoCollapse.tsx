'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import Collapse from '@/components/common/Collapse/Collapse';
import { NoDataMessage } from '../InfoCollapse.styles';

import PeBasicCollapse from './sub/PeBasicCollapse';
import PeHeadersCollapse from './sub/PeHeadersCollapse';
import PeDirectoriesCollapse from './sub/PeDirectoriesCollapse';
import PeSectionsCollapse from './sub/PeSectionsCollapse';
import PeImportsExportsCollapse from './sub/PeImportsExportsCollapse';
import PeSecurityTlsCollapse from './sub/PeSecurityTlsCollapse';

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
      <PeBasicCollapse />
      <PeHeadersCollapse />
      <PeDirectoriesCollapse />
      <PeSectionsCollapse />
      <PeImportsExportsCollapse />
      <PeSecurityTlsCollapse />
    </>
  );
};

export default React.memo(PeInfoCollapse);
