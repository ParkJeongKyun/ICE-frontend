import React, { useCallback, useState, useRef, useEffect } from 'react';
import { HexViewerRef } from '@/components/HexViewer';
import { useTabData } from '@/contexts/TabDataContext';
import {
  NavigatorContainer,
  NavigatorInput,
  NavigatorButton,
  RadixButton,
} from './index.styles';
import SearchIcon from '@/components/common/Icons/SearchIcon';

type Radix = 16 | 10 | 8;

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
}

const OffsetNavigator: React.FC<Props> = ({ hexViewerRef }) => {
  const { activeKey, isEmpty } = useTabData();
  const [inputValue, setInputValue] = useState('');
  const [radix, setRadix] = useState<Radix>(16);
  const activeKeyRef = useRef(activeKey);

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

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
      if (!hexViewerRef.current || !offsetStr) return;

      // 진법에 따라 10진수로 변환 후 16진수 문자열로 변환
      const decimalValue = parseInt(offsetStr, radix);
      if (isNaN(decimalValue)) return;
      
      const hexStr = decimalValue.toString(16);
      const result = await hexViewerRef.current.findByOffset(hexStr);
      if (result && activeKeyRef.current === activeKey) {
        hexViewerRef.current.scrollToIndex(result.index, result.offset);
      }
    },
    [hexViewerRef, activeKey, radix]
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
  const placeholder = radix === 16 ? '오프셋 검색(16진수)' : radix === 10 ? '오프셋 검색(10진수)' : '오프셋 검색(8진수)';

  return (
    <NavigatorContainer>
      <RadixButton onClick={handleRadixChange} title="16/10/8진수 전환">
        {radixLabel}
      </RadixButton>
      <NavigatorInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        maxLength={radix === 16 ? 8 : radix === 10 ? 10 : 11}
        placeholder={placeholder}
      />
      <NavigatorButton onClick={handleButtonClick} title="오프셋으로 이동">
        <SearchIcon width={16} height={16} />
      </NavigatorButton>
    </NavigatorContainer>
  );
};

export default React.memo(OffsetNavigator);
