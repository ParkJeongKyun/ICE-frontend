'use client';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import Collapse from '@/components/common/Collapse/Collapse';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import eventBus from '@/types/eventBus';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';
import Tooltip from '@/components/common/Tooltip/Tooltip';

const HashCalculator: React.FC = () => {
  const t = useTranslations();
  const { hashManager } = useWorker();
  const { startProcessing, stopProcessing } = useProcess();
  const { activeData } = useTab();
  const [hashValue, setHashValue] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateHashClick = useCallback(async () => {
    if (!activeData?.file) {
      eventBus.emit('toast', { code: 'NO_FILE_SELECTED' });
      return;
    }

    if (!hashManager) {
      eventBus.emit('toast', { code: 'WORKER_NOT_INITIALIZED' });
      return;
    }

    if (isCalculating) {
      eventBus.emit('toast', { code: 'ALREADY_CALCULATING' });
      return;
    }

    setHashValue(null);
    setIsCalculating(true);
    startProcessing();

    try {
      const result = await hashManager.execute('PROCESS_HASH', {
        file: activeData.file,
      });

      if (result.data?.hash) {
        setHashValue(result.data.hash);
        eventBus.emit('toast', { code: 'HASH_CALCULATION_SUCCESS' });
      }
    } catch (error) {
      console.error('[HashCalculator] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      eventBus.emit('toast', { code: 'COMMON_ERROR', message: errorMsg });
    } finally {
      stopProcessing();
      setIsCalculating(false);
    }
  }, [
    activeData?.file,
    hashManager,
    isCalculating,
    startProcessing,
    stopProcessing,
  ]);

  const handleCopyHash = useCallback(() => {
    if (hashValue) {
      navigator.clipboard.writeText(hashValue);
      eventBus.emit('toast', { code: 'COPY_SUCCESS' });
    }
  }, [hashValue]);

  return (
    <Collapse title={t('calculateHash.title')} open={false}>
      <HashDiv>
        <HashButtonDiv
          onClick={handleCalculateHashClick}
          $disabled={isCalculating}
        >
          {isCalculating
            ? t('calculateHash.calculating')
            : t('calculateHash.title')}
        </HashButtonDiv>
        {hashValue && (
          <HashResultDiv>
            <HashValueText>{hashValue}</HashValueText>
            <Tooltip text={t('common.copy')}>
              <CopyButton onClick={handleCopyHash}>
                <FlopyIcon width={16} height={16} />
              </CopyButton>
            </Tooltip>
          </HashResultDiv>
        )}
      </HashDiv>
    </Collapse>
  );
};

const HashDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
`;

const HashButtonDiv = styled.button<{ $disabled?: boolean }>`
  padding: 8px 12px;
  background-color: var(--main-hover-color);
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  color: var(--main-color);
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.85rem;
  transition: all 0.15s ease;
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${(props) =>
      props.$disabled ? 'var(--main-hover-color)' : 'var(--ice-main-color)'};
    color: ${(props) =>
      props.$disabled ? 'var(--main-color)' : 'var(--main-bg-color)'};
  }
`;

const HashResultDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: var(--main-hover-color);
  border-radius: 4px;
  border: 1px solid var(--main-line-color);
`;

const HashValueText = styled.div`
  flex: 1;
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--ice-main-color);
  word-break: break-all;
`;

const CopyButton = styled.button`
  padding: 4px 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    color: var(--ice-main-color);
  }
`;

export default React.memo(HashCalculator);
