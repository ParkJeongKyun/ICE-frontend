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

const PeImportsExportsCollapse: React.FC = () => {
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

  const hasImports = peData.imports && peData.imports.length > 0;
  const hasExports = peData.exports && peData.exports.length > 0;

  if (!hasImports && !hasExports) return null;

  return (
    <Collapse
      id="pe-imports-exports"
      title={t('peInfo.groups.importsExports')}
      open
    >
      {hasImports && (
        <>
          <SubHeader>{t('peInfo.imports')}</SubHeader>
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid var(--main-line-color)',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            {peData.imports.map((lib, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '8px',
                  padding: '6px',
                  background: 'var(--main-hover-color)',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'var(--ice-main-color)',
                    marginBottom: '4px',
                  }}
                >
                  {lib.library}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    opacity: 0.9,
                    color: 'var(--main-color)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                  }}
                >
                  {lib.imports.map((imp, j) => (
                    <span
                      key={j}
                      style={{
                        background: 'var(--main-bg-color)',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        border: '1px solid var(--main-line-color)',
                      }}
                    >
                      {imp.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {hasExports && (
        <>
          <SubHeader>{t('peInfo.exports')}</SubHeader>
          <SectionTable>
            <thead>
              <tr>
                <th>{t('peInfo.sectionName')}</th>
                <th>{t('peInfo.address')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {peData.exports.map((e, i) => (
                <tr key={i}>
                  <td>{e.name}</td>
                  <td>{formatOffset(e.address, config.ui.numberBase)}</td>
                  <td>
                    <JumpButton onClick={() => onJumpToOffset(e.offset)}>
                      <ChevronRightIcon width={12} height={12} />
                    </JumpButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </SectionTable>
        </>
      )}
    </Collapse>
  );
};

export default React.memo(PeImportsExportsCollapse);
