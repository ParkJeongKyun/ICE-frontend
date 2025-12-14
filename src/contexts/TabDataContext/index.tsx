import { TabData, TabKey } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useWorker } from '@/contexts/WorkerContext';

export type EncodingType = 'ansi' | 'oem' | 'ascii' | 'mac' | 'ebcdic';

export interface SelectionState {
  start: number | null;
  end: number | null;
}

// ✅ 간소화된 인터페이스
interface TabDataContextType {
  tabData: TabData;
  setTabData: React.Dispatch<React.SetStateAction<TabData>>;
  activeKey: TabKey;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
  getNewKey: () => TabKey;
  activeData: TabData[TabKey];
  isEmpty: boolean;
  encoding: EncodingType;
  setEncoding: (encoding: EncodingType) => void;
  scrollPositions: Record<TabKey, number>;
  setScrollPositions: React.Dispatch<
    React.SetStateAction<Record<TabKey, number>>
  >;
  selectionStates: Record<TabKey, SelectionState>;
  setSelectionStates: React.Dispatch<
    React.SetStateAction<Record<TabKey, SelectionState>>
  >;
  deleteTab: (key: TabKey) => void;
  tabOrder: TabKey[];
  setTabOrder: React.Dispatch<React.SetStateAction<TabKey[]>>;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

const TabDataContext = createContext<TabDataContextType | undefined>(undefined);

export const encodingOptions = [
  { value: 'ascii', label: 'ASCII' },
  { value: 'ansi', label: 'ANSI(Windows-1252)' },
  { value: 'oem', label: 'OEM(CP437)' },
  { value: 'mac', label: 'Macintosh(Mac Roman)' },
  { value: 'ebcdic', label: 'EBCDIC(IBM Mainframe)' },
];

export const TabDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabData, setTabData] = useState<TabData>({});
  const [activeKey, setActiveKey] = useState<TabKey>('');
  const [encodingState, setEncodingState] = useState<EncodingType>('ansi'); // ✅ 이름 변경
  const [scrollPositions, setScrollPositions] = useState<
    Record<TabKey, number>
  >({});
  const [selectionStates, setSelectionStates] = useState<
    Record<TabKey, SelectionState>
  >({});
  const [tabOrder, setTabOrder] = useState<TabKey[]>([]);

  // ✅ 다른 Context 사용
  const { deleteWorkerCache } = useWorker();

  // ✅ setEncoding 함수 명시
  const setEncoding = useCallback((newEncoding: EncodingType) => {
    setEncodingState(newEncoding);
  }, []);

  const getNewKey = useCallback((): TabKey => {
    return ('tab-' + crypto.randomUUID()) as TabKey;
  }, []);

  const activeData = useMemo(() => tabData[activeKey], [tabData, activeKey]);
  const isEmpty = useMemo(() => Object.keys(tabData).length === 0, [tabData]);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabOrder((prev) => {
      const newOrder = [...prev];
      const [movedTab] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedTab);
      return newOrder;
    });
  }, []);

  const deleteTab = useCallback(
    (key: TabKey) => {
      deleteWorkerCache(key); // ✅ Worker 캐시만 정리

      setTabData((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });

      setScrollPositions((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });

      setSelectionStates((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });

      setTabOrder((prev) => prev.filter((k) => k !== key));
    },
    [deleteWorkerCache] // ✅ 의존성 간소화
  );

  useEffect(() => {
    const currentKeys = Object.keys(tabData) as TabKey[];
    setTabOrder((prev) => {
      const newKeys = currentKeys.filter((key) => !prev.includes(key));
      const validKeys = prev.filter((key) => currentKeys.includes(key));
      return [...validKeys, ...newKeys];
    });
  }, [tabData]);

  const contextValue = useMemo(
    () => ({
      tabData,
      setTabData,
      activeKey,
      setActiveKey,
      getNewKey,
      activeData,
      isEmpty,
      encoding: encodingState, // ✅ state 사용
      setEncoding, // ✅ 안전한 setter
      scrollPositions,
      setScrollPositions,
      selectionStates,
      setSelectionStates,
      deleteTab,
      tabOrder,
      setTabOrder,
      reorderTabs,
    }),
    [
      tabData,
      activeKey,
      activeData,
      isEmpty,
      encodingState, // ✅ 의존성 변경
      setEncoding, // ✅ 의존성 추가
      scrollPositions,
      selectionStates,
      tabOrder,
      getNewKey,
      deleteTab,
      reorderTabs,
    ]
  );

  return (
    <TabDataContext.Provider value={contextValue}>
      {children}
    </TabDataContext.Provider>
  );
};

export const useTabData = () => {
  const context = useContext(TabDataContext);
  if (!context) {
    throw new Error('useTabData must be used within a TabDataProvider');
  }
  return context;
};
