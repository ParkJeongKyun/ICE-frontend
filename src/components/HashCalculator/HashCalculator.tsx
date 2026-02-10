'use client';

import React, { useCallback, useReducer, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import Collapse from '@/components/common/Collapse/Collapse';
import { useHash } from './hooks/useHash';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { initialHashState, hashReducer } from './hooks/useHashReducer';
import type { HashType, HashResult } from '@/types/hash';
import eventBus from '@/types/eventBus';
import FlopyIcon from '@/components/common/Icons/FlopyIcon';
import Tooltip from '@/components/common/Tooltip/Tooltip';

const HASH_TYPES: HashType[] = ['sha256', 'sha512', 'md5', 'sha1'];

const HashCalculator: React.FC = () => {
  const t = useTranslations();
  const { activeKey, activeData } = useTab();
  const { calculateSHA256, calculateSHA512, calculateMD5, calculateSHA1 } =
    useHash();

  const [hashResults, dispatch] = useReducer(hashReducer, initialHashState);
  const [calculatingHash, setCalculatingHash] = React.useState<HashType | null>(
    null
  );

  const getCacheKey = useCallback(() => {
    if (!activeData?.file) return null;
    return `${activeKey}:${activeData.file.name}:${activeData.file.size}`;
  }, [activeKey, activeData]);

  const handleCalculateHash = useCallback(
    async (hashType: HashType) => {
      if (!activeData?.file) {
        eventBus.emit('toast', { code: 'NO_FILE_SELECTED' });
        return;
      }

      const cacheKey = getCacheKey();
      if (!cacheKey) return;

      // 캐시 확인
      const cachedResult = hashResults.__cache__.get(cacheKey);
      if (cachedResult && cachedResult[hashType]) {
        // 이미 계산된 해시 타입이면 캐시에서 가져오기
        if (process.env.NODE_ENV === 'development') {
          console.log(`[HashCalculator] 캐시 HIT: ${hashType}`);
        }
        dispatch({
          type: 'SET_HASH',
          key: activeKey,
          hashType,
          hashValue: cachedResult[hashType]!,
          fileName: activeData.file.name,
          fileSize: activeData.file.size,
        });
        eventBus.emit('toast', {
          code: 'HASH_CALCULATION_SUCCESS',
          message: t('calculateHash.success', {
            type: hashType.toUpperCase(),
          }),
        });
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[HashCalculator] 캐시 MISS: ${hashType}`);
      }

      setCalculatingHash(hashType);

      try {
        let result = null;

        switch (hashType) {
          case 'sha256':
            result = await calculateSHA256();
            break;
          case 'sha512':
            result = await calculateSHA512();
            break;
          case 'md5':
            result = await calculateMD5();
            break;
          case 'sha1':
            result = await calculateSHA1();
            break;
        }

        if (result?.data?.hash) {
          dispatch({
            type: 'SET_HASH',
            key: activeKey,
            hashType,
            hashValue: result.data.hash,
            fileName: activeData.file.name,
            fileSize: activeData.file.size,
          });

          // 캐시에 저장
          const cacheResult: HashResult = {
            fileName: activeData.file.name,
            fileSize: activeData.file.size,
            [hashType]: result.data.hash,
            lastCalculated: {
              [hashType]: Date.now(),
            },
          };

          dispatch({
            type: 'SET_CACHE',
            cacheKey,
            result: cacheResult,
          });

          eventBus.emit('toast', {
            code: 'HASH_CALCULATION_SUCCESS',
            message: t('calculateHash.success', {
              type: hashType.toUpperCase(),
            }),
            stats: result.stats,
          });
        }
      } catch (error) {
        console.error(`[HashCalculator] Error calculating ${hashType}:`, error);
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        eventBus.emit('toast', { code: 'COMMON_ERROR', message: errorMsg });
      } finally {
        setCalculatingHash(null);
      }
    },
    [
      activeData,
      activeKey,
      getCacheKey,
      hashResults.__cache__,
      calculateSHA256,
      calculateSHA512,
      calculateMD5,
      calculateSHA1,
      t,
    ]
  );

  const currentResult = useMemo(() => {
    const result = hashResults[activeKey];
    return result && !(result instanceof Map) ? (result as HashResult) : null;
  }, [hashResults, activeKey]);

  const handleCopyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash);
    eventBus.emit('toast', { code: 'COPY_SUCCESS' });
  }, []);

  return (
    <Collapse title={t('calculateHash.title')} open={false}>
      <HashDiv>
        <HashButtonContainer>
          {HASH_TYPES.map((hashType) => (
            <HashButton
              key={hashType}
              onClick={() => handleCalculateHash(hashType)}
              $disabled={calculatingHash !== null}
              $isCalculating={calculatingHash === hashType}
              title={t('calculateHash.calculateTooltip', {
                type: hashType.toUpperCase(),
              })}
            >
              {calculatingHash === hashType
                ? t('calculateHash.calculating')
                : hashType.toUpperCase()}
            </HashButton>
          ))}
        </HashButtonContainer>

        {currentResult && (
          <HashResultsContainer>
            {HASH_TYPES.map(
              (hashType) =>
                currentResult[hashType] && (
                  <HashResultItem key={hashType}>
                    <HashLabel>{hashType.toUpperCase()}</HashLabel>
                    <HashValueContainer>
                      <HashValueText>{currentResult[hashType]}</HashValueText>
                      <Tooltip text={t('common.copy')}>
                        <CopyButton
                          onClick={() =>
                            handleCopyHash(currentResult[hashType]!)
                          }
                        >
                          <FlopyIcon width={14} height={14} />
                        </CopyButton>
                      </Tooltip>
                    </HashValueContainer>
                  </HashResultItem>
                )
            )}
          </HashResultsContainer>
        )}
      </HashDiv>
    </Collapse>
  );
};

const HashDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
`;

const HashButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const HashButton = styled.button<{
  $disabled?: boolean;
  $isCalculating?: boolean;
}>`
  padding: 8px 12px;
  background-color: ${(props) =>
    props.$isCalculating ? 'var(--ice-main-color)' : 'var(--main-hover-color)'};
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  color: ${(props) =>
    props.$isCalculating ? 'var(--main-bg-color)' : 'var(--main-color)'};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.8rem;
  font-weight: ${(props) => (props.$isCalculating ? '600' : '400')};
  transition: all 0.15s ease;
  opacity: ${(props) => (props.$disabled && !props.$isCalculating ? 0.5 : 1)};

  &:hover {
    background-color: ${(props) =>
      props.$disabled && !props.$isCalculating
        ? 'var(--main-hover-color)'
        : 'var(--ice-main-color)'};
    color: ${(props) =>
      props.$disabled && !props.$isCalculating
        ? 'var(--main-color)'
        : 'var(--main-bg-color)'};
  }
`;

const HashResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: var(--main-hover-color);
  border-radius: 4px;
  border: 1px solid var(--main-line-color);
`;

const HashResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HashLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ice-main-color);
  text-transform: uppercase;
  opacity: 0.8;
`;

const HashValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HashValueText = styled.div`
  flex: 1;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--main-color);
  word-break: break-all;
  opacity: 0.9;
`;

const CopyButton = styled.button`
  padding: 3px 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    color: var(--ice-main-color);
  }
`;

export default React.memo(HashCalculator);
