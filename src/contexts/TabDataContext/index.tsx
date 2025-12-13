import { TabData, TabKey } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

// 인코딩 타입 정의
export type EncodingType = 'ansi' | 'oem' | 'ascii' | 'mac' | 'ebcdic';

// ✅ Worker 캐시 타입 정의
export interface WorkerCache {
  worker: Worker;
  cache: Map<number, Uint8Array>;
  cleanup?: () => void;
}

// ✅ 선택 영역 타입 추가
export interface SelectionState {
  start: number | null;
  end: number | null;
}

// 컨텍스트 생성
interface TabDataContextType {
  tabData: TabData;
  setTabData: Dispatch<SetStateAction<TabData>>;
  activeKey: TabKey;
  setActiveKey: Dispatch<SetStateAction<TabKey>>;
  getNewKey: () => TabKey;
  activeData: TabData[TabKey];
  isEmpty: boolean;
  encoding: EncodingType;
  setEncoding: (encoding: EncodingType) => void;
  scrollPositions: Record<TabKey, number>;
  setScrollPositions: Dispatch<SetStateAction<Record<TabKey, number>>>;
  // ✅ 선택 영역 관리 추가
  selectionStates: Record<TabKey, SelectionState>;
  setSelectionStates: Dispatch<SetStateAction<Record<TabKey, SelectionState>>>;
  // ✅ Worker 관리 추가
  getWorkerCache: (key: TabKey) => WorkerCache | undefined;
  setWorkerCache: (key: TabKey, cache: WorkerCache) => void;
  // ✅ 탭 삭제 및 정리
  deleteTab: (key: TabKey) => void;
  // ✅ 탭 순서 관리 추가
  tabOrder: TabKey[];
  setTabOrder: Dispatch<SetStateAction<TabKey[]>>;
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

// 컨텍스트 프로바이더 컴포넌트
export const TabDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabData, setTabData] = useState<TabData>({});
  const [activeKey, setActiveKey] = useState<TabKey>('');
  const [encoding, setEncoding] = useState<EncodingType>('ansi');
  const [scrollPositions, setScrollPositions] = useState<
    Record<TabKey, number>
  >({});
  const [selectionStates, setSelectionStates] = useState<
    Record<TabKey, SelectionState>
  >({});
  const [tabOrder, setTabOrder] = useState<TabKey[]>([]);

  const workerCacheRef = useRef<Map<TabKey, WorkerCache>>(new Map());

  const getNewKey = useCallback((): TabKey => {
    return ('tab-' + crypto.randomUUID()) as TabKey;
  }, []);

  const activeData = useMemo(() => tabData[activeKey], [tabData, activeKey]);
  const isEmpty = useMemo(() => Object.keys(tabData).length === 0, [tabData]);

  const getWorkerCache = useCallback((key: TabKey) => {
    return workerCacheRef.current.get(key);
  }, []);

  const setWorkerCache = useCallback((key: TabKey, cache: WorkerCache) => {
    workerCacheRef.current.set(key, cache);
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabOrder((prev) => {
      const newOrder = [...prev];
      const [movedTab] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedTab);
      return newOrder;
    });
  }, []);

  // ✅ cleanupTab을 deleteTab으로 통합
  const deleteTab = useCallback((key: TabKey) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TabDataContext] 탭 삭제: ${key}`);
    }

    // Worker cleanup
    const cache = workerCacheRef.current.get(key);
    if (cache?.cleanup) {
      cache.cleanup();
    }
    workerCacheRef.current.delete(key);

    // State cleanup
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
  }, []);

  // ✅ tabData 변경 시 tabOrder 동기화
  useEffect(() => {
    const currentKeys = Object.keys(tabData) as TabKey[];
    setTabOrder((prev) => {
      const newKeys = currentKeys.filter((key) => !prev.includes(key));
      const validKeys = prev.filter((key) => currentKeys.includes(key));
      return [...validKeys, ...newKeys];
    });
  }, [tabData]);

  // ✅ 컴포넌트 언마운트 시 모든 Worker 정리
  useEffect(() => {
    return () => {
      workerCacheRef.current.forEach(({ worker }) => worker.terminate());
      workerCacheRef.current.clear();
    };
  }, []);

  // ✅ value를 useMemo로 메모이제이션하여 불필요한 리렌더링 방지
  const contextValue = useMemo(
    () => ({
      tabData,
      setTabData,
      activeKey,
      setActiveKey,
      getNewKey,
      activeData,
      isEmpty,
      encoding,
      setEncoding,
      scrollPositions,
      setScrollPositions,
      selectionStates,
      setSelectionStates,
      getWorkerCache,
      setWorkerCache,
      deleteTab, // ✅ cleanupTab 대신 deleteTab
      tabOrder,
      setTabOrder,
      reorderTabs,
    }),
    [
      tabData,
      activeKey,
      activeData,
      isEmpty,
      encoding,
      scrollPositions,
      selectionStates,
      tabOrder,
      getNewKey,
      getWorkerCache,
      setWorkerCache,
      deleteTab, // ✅ cleanupTab 대신 deleteTab
      reorderTabs,
    ]
  );

  return (
    <TabDataContext.Provider value={contextValue}>
      {children}
    </TabDataContext.Provider>
  );
};

// 컨텍스트 사용을 위한 훅
export const useTabData = () => {
  const context = useContext(TabDataContext);
  if (!context) {
    throw new Error('useTabData must be used within a TabDataProvider');
  }
  return context;
};
