'use client';

import React, { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import { getOffsetPrefix } from '@/utils/formatters';
import { parseOffsetInput } from '@/utils/offsetUtils';
import {
  NavigatorContainer,
  NavigatorInput,
  NavigatorButton,
  RadixButton,
} from './OffsetNavigator.styles';
import SearchIcon from '@/components/common/Icons/SearchIcon';
import Tooltip from '@/components/common/Tooltip/Tooltip';

const OffsetNavigator: React.FC = () => {
  const t = useTranslations();
  const { config, updateConfig } = useConfig();
  const { searcherRef } = useRefs();
  const { isEmpty } = useTab();
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // 입력값을 현재 진법에 맞춰 필터링하는 로직 (기존 유지)
      let filtered: string;
      const base = config.ui.numberBase;
      if (base === 'hexadecimal') {
        filtered = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      } else if (base === 'decimal') {
        filtered = e.target.value.replace(/[^0-9]/g, '');
      } else if (base === 'octal') {
        filtered = e.target.value.replace(/[^0-7]/g, '');
      } else {
        // 2진수
        filtered = e.target.value.replace(/[^0-1]/g, '');
      }
      setInputValue(filtered);
    },
    [config.ui.numberBase]
  );

  const navigateToOffset = useCallback(
    async (offsetStr: string) => {
      if (!offsetStr || !searcherRef.current) return;

      const decimalValue = parseOffsetInput(offsetStr, config.ui.numberBase);
      if (isNaN(decimalValue)) return;

      await searcherRef.current.findByOffset(decimalValue);
    },
    [searcherRef, config.ui.numberBase]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue) {
        navigateToOffset(inputValue);
      }
    },
    [inputValue, navigateToOffset]
  );

  const handleButtonClick = useCallback(() => {
    if (inputValue) {
      navigateToOffset(inputValue);
    }
  }, [inputValue, navigateToOffset]);

  const handleRadixChange = useCallback(() => {
    const bases = ['hexadecimal', 'decimal', 'octal', 'binary'] as const;
    const currentIndex = bases.indexOf(config.ui.numberBase);
    const nextIndex = (currentIndex + 1) % bases.length;
    updateConfig({ ui: { ...config.ui, numberBase: bases[nextIndex] } });
    setInputValue('');
  }, [config.ui, updateConfig]);

  if (isEmpty) return null;

  const radixLabel = getOffsetPrefix(config.ui.numberBase);
  const placeholder =
    config.ui.numberBase === 'hexadecimal'
      ? t('offsetNavigator.hexPlaceholder')
      : config.ui.numberBase === 'decimal'
        ? t('offsetNavigator.decPlaceholder')
        : config.ui.numberBase === 'octal'
          ? t('offsetNavigator.octPlaceholder')
          : t('offsetNavigator.binPlaceholder');

  return (
    <NavigatorContainer>
      <Tooltip text={t('offsetNavigator.radixTooltip')}>
        <RadixButton onClick={handleRadixChange}>{radixLabel}</RadixButton>
      </Tooltip>
      <NavigatorInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
      />
      <Tooltip text={t('offsetNavigator.navigateTooltip')}>
        <NavigatorButton
          onClick={handleButtonClick}
          aria-label={t('offsetNavigator.navigateTooltip')}
        >
          <SearchIcon width={16} height={16} />
        </NavigatorButton>
      </Tooltip>
    </NavigatorContainer>
  );
};

export default React.memo(OffsetNavigator);
