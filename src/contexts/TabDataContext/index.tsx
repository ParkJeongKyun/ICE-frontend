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

// === Tab Data Context (탭 데이터, 거의 변하지 않음) ===
interface TabContextType {
  tabData: TabData;
  setTabData: React.Dispatch<React.SetStateAction<TabData>>;
  activeKey: TabKey;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
  getNewKey: () => TabKey;
  activeData: TabData[TabKey];
  isEmpty: boolean;
  encoding: EncodingType;
  setEncoding: (encoding: EncodingType) => void;
  deleteTab: (key: TabKey) => void;
  tabOrder: TabKey[];
  setTabOrder: React.Dispatch<React.SetStateAction<TabKey[]>>;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  tabDisplayStates: Record<TabKey, TabDisplayState>;
  updateTabDisplayState: (tabKey: TabKey, state: Partial<TabDisplayState>) => void;
}

// === Scroll Context (스크롤, 자주 변함) ===
interface ScrollContextType {
  scrollPositions: Record<TabKey, number>;
  setScrollPositions: React.Dispatch<React.SetStateAction<Record<TabKey, number>>>;
}

// === Selection Context (선택, 자주 변함) ===
interface SelectionContextType {
  selectionStates: Record<TabKey, SelectionState>;
  setSelectionStates: React.Dispatch<React.SetStateAction<Record<TabKey, SelectionState>>>;
  activeSelectionState: SelectionState;
}

const TabContext = createContext<TabContextType | undefined>(undefined);
const ScrollContext = createContext<ScrollContextType | undefined>(undefined);
const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

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

  // === Tab Context (거의 변하지 않음) ===
  const tabContextValue = useMemo(
    () => ({
      tabData,
      setTabData,
      activeKey,
      setActiveKey,
      getNewKey,
      activeData,
      isEmpty,
      encoding: encodingState,
      setEncoding,
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
      encodingState,
      setEncoding,
      tabOrder,
      getNewKey,
      deleteTab,
      reorderTabs,
      tabDisplayStates,
      updateTabDisplayState,
    ]
  );

  // === Scroll Context (자주 변함) ===
  const scrollContextValue = useMemo(
    () => ({
      scrollPositions,
      setScrollPositions,
    }),
    [scrollPositions]
  );

  // === Selection Context (자주 변함) ===
  const selectionContextValue = useMemo(
    () => ({
      selectionStates,
      setSelectionStates,
      activeSelectionState,
    }),
    [selectionStates, activeSelectionState]
  );

  // === Legacy Context (하위 호환성) ===
  // 더 이상 생성되지 않음
  
  return (
    <TabContext.Provider value={tabContextValue}>
      <ScrollContext.Provider value={scrollContextValue}>
        <SelectionContext.Provider value={selectionContextValue}>
          {children}
        </SelectionContext.Provider>
      </ScrollContext.Provider>
    </TabContext.Provider>
  );
};

// === 새로운 Hook들 (권장) ===
export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabDataProvider');
  }
  return context;
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a TabDataProvider');
  }
  return context;
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a TabDataProvider');
  }
  return context;
};
