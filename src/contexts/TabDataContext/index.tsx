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
  cursor: number | null;
  start: number | null;
  end: number | null;
  isDragging: boolean;
  dragStart: number | null;
  selectedBytes?: Uint8Array;
}

// 탭별 표시 상태: 현재 표시 중인 이미지 좌표와 주소
export interface TabDisplayState {
  latitude?: string;
  longitude?: string;
  address?: string;
}

interface TabDataContextType {
  tabData: TabData;
  setTabData: React.Dispatch<React.SetStateAction<TabData>>;
  activeKey: TabKey;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
  getNewKey: () => TabKey;
  activeData: TabData[TabKey];
  activeSelectionState: SelectionState;
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
  // 탭별 표시 상태 관리
  tabDisplayStates: Record<TabKey, TabDisplayState>;
  updateTabDisplayState: (tabKey: TabKey, state: Partial<TabDisplayState>) => void;
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
  const [encodingState, setEncodingState] = useState<EncodingType>('ansi');
  const [scrollPositions, setScrollPositions] = useState<Record<TabKey, number>>({});
  const [selectionStates, setSelectionStates] = useState<Record<TabKey, SelectionState>>({});
  const [tabOrder, setTabOrder] = useState<TabKey[]>([]);
  const [tabDisplayStates, setTabDisplayStates] = useState<Record<TabKey, TabDisplayState>>({});

  const { deleteWorkerCache } = useWorker();

  const setEncoding = useCallback((newEncoding: EncodingType) => {
    setEncodingState(newEncoding);
  }, []);

  const updateTabDisplayState = useCallback(
    (tabKey: TabKey, state: Partial<TabDisplayState>) => {
      setTabDisplayStates((prev) => ({
        ...prev,
        [tabKey]: { ...prev[tabKey], ...state },
      }));
    },
    []
  );

  const getNewKey = useCallback((): TabKey => {
    return `tab-${crypto.randomUUID()}` as TabKey;
  }, []);

  const activeData = tabData[activeKey];
  const isEmpty = Object.keys(tabData).length === 0;

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
      deleteWorkerCache(key);

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

      setTabDisplayStates((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });

      setTabOrder((prev) => prev.filter((k) => k !== key));
    },
    [deleteWorkerCache]
  );

  useEffect(() => {
    const currentKeys = Object.keys(tabData) as TabKey[];
    setTabOrder((prev) => {
      const newKeys = currentKeys.filter((key) => !prev.includes(key));
      const validKeys = prev.filter((key) => currentKeys.includes(key));
      return [...validKeys, ...newKeys];
    });
  }, [tabData]);

  const activeSelectionState = useMemo(
    () =>
      selectionStates[activeKey] || {
        cursor: null,
        start: null,
        end: null,
        isDragging: false,
        dragStart: null,
        selectedBytes: undefined,
      },
    [selectionStates, activeKey]
  );

  const contextValue = useMemo(
    () => ({
      tabData,
      setTabData,
      activeKey,
      setActiveKey,
      getNewKey,
      activeData,
      activeSelectionState,
      isEmpty,
      encoding: encodingState,
      setEncoding,
      scrollPositions,
      setScrollPositions,
      selectionStates,
      setSelectionStates,
      deleteTab,
      tabOrder,
      setTabOrder,
      reorderTabs,
      tabDisplayStates,
      updateTabDisplayState,
    }),
    [
      tabData,
      activeKey,
      activeData,
      activeSelectionState,
      isEmpty,
      encodingState,
      setEncoding,
      scrollPositions,
      selectionStates,
      tabOrder,
      getNewKey,
      deleteTab,
      reorderTabs,
      tabDisplayStates,
      updateTabDisplayState,
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
