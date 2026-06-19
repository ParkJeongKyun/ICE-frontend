'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import Collapse from '@/components/common/Collapse/Collapse';
import ChevronRightIcon from '@/components/common/Icons/ChevronRightIcon';
import { SubHeader, JumpButton, SectionTable } from '../../InfoCollapse.styles';
import { formatOffset } from '@/utils/formatters';

const PeDirectoriesCollapse: React.FC = () => {
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

  const hasDirectories = peData.dataDirectories && peData.dataDirectories.length > 0;
  const hasRichHeader = peData.richHeader && peData.richHeader.items && peData.richHeader.items.length > 0;

  if (!hasDirectories && !hasRichHeader) return null;

  return (
    <Collapse title={t('peInfo.groups.directoriesRich')}>
      {hasDirectories && (
        <>
          <SubHeader>{t('peInfo.dataDirectories')}</SubHeader>
          <SectionTable>
            <thead>
              <tr>
                <th>{t('peInfo.sectionName')}</th>
                <th>V.Address</th>
                <th>{t('peInfo.offset')}</th>
                <th>{t('peInfo.rawSize')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {peData.dataDirectories.map((d, i) => (
                <tr key={i}>
                  <td>{d.name}</td>
                  <td>0x{d.virtualAddress.toString(16)}</td>
                  <td>{formatOffset(d.fileOffset, config.ui.numberBase)}</td>
                  <td>{formatOffset(d.size, config.ui.numberBase)}</td>
                  <td>
                    <JumpButton onClick={() => onJumpToOffset(d.fileOffset)}>
                      <ChevronRightIcon width={12} height={12} />
                    </JumpButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </SectionTable>
        </>
      )}
      {hasRichHeader && (
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

export default React.memo(PeDirectoriesCollapse);
