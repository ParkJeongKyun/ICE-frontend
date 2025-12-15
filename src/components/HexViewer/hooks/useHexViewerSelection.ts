import { useCallback } from 'react';
import { useTabData } from '@/contexts/TabDataContext';
import { TabKey } from '@/types';

interface UseHexViewerSelectionProps {
  activeKey: TabKey;
  setRenderTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const useHexViewerSelection = ({
  activeKey,
  setRenderTrigger,
}: UseHexViewerSelectionProps) => {
  const { setSelectionStates } = useTabData();

  const updateSelection = useCallback(
    (start: number | null, end: number | null) => {
      setSelectionStates((prev) => ({ ...prev, [activeKey]: { start, end } }));
      setRenderTrigger((prev) => prev + 1); // ✅ 선택 변경 시 렌더링 트리거
    },
    [activeKey, setSelectionStates, setRenderTrigger]
  );

  return { updateSelection };
};
