import React, { useCallback, useState, useRef, useEffect } from 'react';
import { HexViewerRef } from '@/components/HexViewer';
import { useTabData } from '@/contexts/TabDataContext';
import {
  NavigatorContainer,
  NavigatorLabel,
  NavigatorInput,
  NavigatorButton,
} from './index.styles';
import SearchIcon from '@/components/common/Icons/SearchIcon';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
}

const OffsetNavigator: React.FC<Props> = ({ hexViewerRef }) => {
  const { activeKey, isEmpty } = useTabData();
  const [inputValue, setInputValue] = useState('');
  const activeKeyRef = useRef(activeKey);

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filtered = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      setInputValue(filtered);
    },
    []
  );

  const navigateToOffset = useCallback(
    async (offsetStr: string) => {
      if (!hexViewerRef.current || !offsetStr) return;

      const result = await hexViewerRef.current.findByOffset(offsetStr);
      if (result && activeKeyRef.current === activeKey) {
        hexViewerRef.current.scrollToIndex(result.index, result.offset);
      }
    },
    [hexViewerRef, activeKey]
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

  if (isEmpty) return null;

  return (
    <NavigatorContainer>
      <NavigatorInput
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        maxLength={8}
        placeholder="Offset (0x...)"
      />
      <NavigatorButton onClick={handleButtonClick} title="오프셋으로 이동">
        <SearchIcon width={16} height={16} />
      </NavigatorButton>
    </NavigatorContainer>
  );
};

export default React.memo(OffsetNavigator);
