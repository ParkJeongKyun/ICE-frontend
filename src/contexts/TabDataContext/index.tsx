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
export type EncodingType = 'latin1' | 'windows-1252' | 'ascii' | 'utf-8';

// ✅ Worker 캐시 타입 정의
export interface WorkerCache {
  worker: Worker;
  cache: Map<number, Uint8Array>;
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
  cleanupTab: (key: TabKey) => void;
  // ✅ 탭 순서 관리 추가
  tabOrder: TabKey[];
  setTabOrder: Dispatch<SetStateAction<TabKey[]>>;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

const TabDataContext = createContext<TabDataContextType | undefined>(undefined);

export const encodingOptions = [
  { value: 'latin1', label: 'ISO-8859-1' },
  { value: 'windows-1252', label: 'Windows-1252' },
  { value: 'ascii', label: 'ASCII' },
  { value: 'utf-8', label: 'UTF-8' },
];

// 컨텍스트 프로바이더 컴포넌트
export const TabDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabData, setTabData] = useState<TabData>({});
  const [activeKey, setActiveKey] = useState<TabKey>('');
  const [encoding, setEncoding] = useState<EncodingType>('windows-1252');
  const [scrollPositions, setScrollPositions] = useState<
    Record<TabKey, number>
  >({});
  const [selectionStates, setSelectionStates] = useState<
    Record<TabKey, SelectionState>
  >({});
  const [tabOrder, setTabOrder] = useState<TabKey[]>([]);

  // ✅ UUID 생성기로 변경
  const generateUUID = useCallback((): string => {
    return 'tab-' + crypto.randomUUID();
  }, []);

  const workerCacheRef = useRef<Map<TabKey, WorkerCache>>(new Map());

  const getNewKey = useCallback((): TabKey => {
    return generateUUID() as TabKey;
  }, [generateUUID]);

  const activeData = useMemo(() => tabData[activeKey], [tabData, activeKey]);
  const isEmpty = useMemo(() => Object.keys(tabData).length === 0, [tabData]);

  // ✅ Worker 캐시 getter/setter
  const getWorkerCache = useCallback((key: TabKey) => {
    return workerCacheRef.current.get(key);
  }, []);

  const setWorkerCache = useCallback((key: TabKey, cache: WorkerCache) => {
    workerCacheRef.current.set(key, cache);
  }, []);

  // ✅ 탭 순서 변경 함수
  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabOrder((prev) => {
      const newOrder = [...prev];
      const [movedTab] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedTab);
      return newOrder;
    });
  }, []);

  const cleanupTab = useCallback((key: TabKey) => {
    // ✅ 로그 레벨 낮추기 (필요시 제거)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TabDataContext] 탭 cleanup: ${key}`);
    }

    // 스크롤 위치 제거
    setScrollPositions((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    // 선택 영역 제거
    setSelectionStates((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });

    // ✅ 탭 순서에서도 제거
    setTabOrder((prev) => prev.filter((k) => k !== key));

    // Worker 정리
    const cache = workerCacheRef.current.get(key);
    if (cache) {
      cache.worker.terminate();
      cache.cache.clear();
      workerCacheRef.current.delete(key);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[TabDataContext] Worker 정리 완료: ${key}`);
      }
    }
  }, []);

  // ✅ tabData 변경 시 tabOrder 동기화
  useEffect(() => {
    const currentKeys = Object.keys(tabData) as TabKey[];
    setTabOrder((prev) => {
      // 새로 추가된 탭을 찾아서 끝에 추가
      const newKeys = currentKeys.filter((key) => !prev.includes(key));
      // 삭제된 탭을 제거
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

  return (
    <TabDataContext.Provider
      value={{
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
        cleanupTab,
        tabOrder,
        setTabOrder,
        reorderTabs,
      }}
    >
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
