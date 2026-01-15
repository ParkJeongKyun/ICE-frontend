import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '@/contexts/TabDataContext';
import { useRefs } from '@/contexts/RefContext';
import {
  NavigatorContainer,
  NavigatorInput,
  NavigatorButton,
  RadixButton,
} from './index.styles';
import SearchIcon from '@/components/common/Icons/SearchIcon';
import Tooltip from '@/components/common/Tooltip';

type Radix = 16 | 10 | 8;

const OffsetNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { searcherRef } = useRefs();
  const { isEmpty } = useTab();
  const [inputValue, setInputValue] = useState('');
  const [radix, setRadix] = useState<Radix>(16);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let filtered: string;
      if (radix === 16) {
        filtered = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      } else if (radix === 10) {
        filtered = e.target.value.replace(/[^0-9]/g, '');
      } else {
        // 8진수
        filtered = e.target.value.replace(/[^0-7]/g, '');
      }
      setInputValue(filtered);
    },
    [radix]
  );

  const navigateToOffset = useCallback(
    async (offsetStr: string) => {
      if (!offsetStr || !searcherRef.current) return;

      // 진법에 따라 10진수로 변환 후 16진수 문자열로 변환
      const decimalValue = parseInt(offsetStr, radix);
      if (isNaN(decimalValue)) return;
      
      const hexStr = decimalValue.toString(16);
      await searcherRef.current.findByOffset(hexStr);
    },
    [searcherRef, radix]
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
    setRadix((prev) => {
      if (prev === 16) return 10;
      if (prev === 10) return 8;
      return 16;
    });
    setInputValue('');
  }, []);

  if (isEmpty) return null;

  const radixLabel = radix === 16 ? '0x' : radix === 10 ? 'De' : '0o';
  const placeholder = 
    radix === 16 ? t('offsetNavigator.hexPlaceholder') : 
    radix === 10 ? t('offsetNavigator.decPlaceholder') : 
    t('offsetNavigator.octPlaceholder');

  return (
    <NavigatorContainer>
      <Tooltip text={t('offsetNavigator.radixTooltip')}>
        <RadixButton onClick={handleRadixChange}>
          {radixLabel}
        </RadixButton>
      </Tooltip>
      <NavigatorInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        maxLength={radix === 16 ? 20 : radix === 10 ? 25 : 27}
        placeholder={placeholder}
      />
      <Tooltip text={t('offsetNavigator.navigateTooltip')}>
        <NavigatorButton onClick={handleButtonClick}>
          <SearchIcon width={16} height={16} />
        </NavigatorButton>
      </Tooltip>
    </NavigatorContainer>
  );
};

export default React.memo(OffsetNavigator);
