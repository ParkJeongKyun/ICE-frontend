import { useCallback } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';

interface UseHexViewerSelectionProps {
  activeKey: TabKey;
}

export const useHexViewerSelection = ({
  activeKey,
}: UseHexViewerSelectionProps) => {
  const { setSelectionStates } = useTabData();

  const updateSelection = useCallback(
    (start: number | null, end: number | null) => {
      setSelectionStates((prev) => ({ ...prev, [activeKey]: { start, end } }));
    },
    [activeKey, setSelectionStates]
  );

  return { updateSelection };
};
