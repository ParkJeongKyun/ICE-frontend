import { useRef, useCallback } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';

export const useHexViewerScroll = (activeKey: TabKey) => {
  const { setScrollPositions } = useTabData();
  const firstRowRef = useRef(0);

  const updateScrollPosition = useCallback(
    (position: number) => {
      firstRowRef.current = position;
      setScrollPositions((prev) => ({ ...prev, [activeKey]: position }));
    },
    [activeKey, setScrollPositions]
  );

  return {
    firstRowRef,
    updateScrollPosition,
  };
};
