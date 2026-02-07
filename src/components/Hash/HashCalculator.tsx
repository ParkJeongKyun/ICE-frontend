'use client';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import MenuBtn from '@/components/common/MenuBtn/MenuBtn';
import eventBus from '@/utils/eventBus';

const HashCalculator: React.FC = () => {
  const t = useTranslations();
  const { hashManager } = useWorker();
  const { startProcessing, stopProcessing } = useProcess();
  const { activeData } = useTab();
  const [showHashMenu, setShowHashMenu] = useState(false);
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

    setShowHashMenu(false);
    setIsCalculating(true);
    startProcessing();

    try {
      // ✅ Promise 기반으로 변경
      const result = await hashManager.execute('PROCESS_HASH', {
        file: activeData.file,
      });

      if (result.hash) {
        console.log('[HashCalculator] Hash received:', result.hash);
        eventBus.emit('toast', {
          code: 'HASH_CALCULATION_SUCCESS',
          customMessage: result.hash,
        });
      } else {
        const error = result.error || 'Failed to calculate hash';
        console.log('[HashCalculator] No hash result:', error);
        eventBus.emit('toast', {
          code: 'COMMON_ERROR',
          customMessage: error,
        });
      }
    } catch (error) {
      console.error('[HashCalculator] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      eventBus.emit('toast', {
        code: 'COMMON_ERROR',
        customMessage: errorMsg,
      });
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

  return (
    <HashMenuContainer>
      <MenuBtn
        onClick={() => setShowHashMenu(!showHashMenu)}
        text={t('menu.calculateHash')}
        disabled={isCalculating}
      />
      {showHashMenu && (
        <HashDropdownMenu>
          <HashMenuList>
            <HashMenuItem
              onClick={handleCalculateHashClick}
              $disabled={isCalculating}
            >
              {isCalculating ? t('menu.calculating') : t('menu.calculateHash')}
            </HashMenuItem>
          </HashMenuList>
        </HashDropdownMenu>
      )}
    </HashMenuContainer>
  );
};

const HashMenuContainer = styled.div`
  position: relative;
`;

const HashDropdownMenu = styled.div`
  position: absolute;
  top: calc(100%);
  left: 0;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  min-width: 120px;
  border-radius: 4px;
  padding: 0;
  user-select: none;
  outline: none;
`;

const HashMenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 5px 5px;
`;

const HashMenuItem = styled.li<{ $disabled?: boolean }>`
  padding: 3px 12px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  color: var(--main-color);
  background: transparent;
  font-size: 0.75rem;
  text-align: left;
  border-radius: 3px;
  transition: all 0.15s ease;
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    background: ${(props) =>
      props.$disabled ? 'transparent' : 'var(--main-hover-color)'};
    color: ${(props) =>
      props.$disabled ? 'var(--main-color)' : 'var(--ice-main-color)'};
  }
`;

export default React.memo(HashCalculator);
