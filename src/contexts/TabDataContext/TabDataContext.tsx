'use client';

import { TabData, TabKey } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';

export type EncodingType = 'ansi' | 'oem' | 'ascii' | 'mac' | 'ebcdic';

export interface SelectionState {
  cursor: number | null;
  start: number | null;
  end: number | null;
  isDragging: boolean;
  dragStart: number | null;
  selectedBytes?: Uint8Array;
}

// 좌표별 표시 상태: 현재 표시 중인 이미지 좌표와 주소
export interface AddressCacheState {
  latitude?: string;
  longitude?: string;
  address?: string;
}

// 언어별 + 좌표키별로 관리되는 AddressCache
// 예: addressCache['ko']['37.123,127.456'] = { latitude, longitude, address }
export type AddressCache = Record<string, Record<string, AddressCacheState>>;

// === AddressCache Context (주소 캐시만 별도 관리) ===
interface AddressCacheContextType {
  addressCache: AddressCache;
  updateAddressCache: (
    lang: string,
    lat: string | number,
    lng: string | number,
    state: Partial<AddressCacheState>
  ) => void;
}

const AddressCacheContext = createContext<AddressCacheContextType | undefined>(
  undefined
);

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
}

// === Scroll Context (스크롤, 자주 변함) ===
interface ScrollContextType {
  scrollPositions: Record<TabKey, number>;
  setScrollPositions: React.Dispatch<
    React.SetStateAction<Record<TabKey, number>>
  >;
}

// === Selection Context (선택, 자주 변함) ===
interface SelectionContextType {
  selectionStates: Record<TabKey, SelectionState>;
  setSelectionStates: React.Dispatch<
    React.SetStateAction<Record<TabKey, SelectionState>>
  >;
  activeSelectionState: SelectionState;
}

const TabContext = createContext<TabContextType | undefined>(undefined);
const ScrollContext = createContext<ScrollContextType | undefined>(undefined);
const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

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
  const [scrollPositions, setScrollPositions] = useState<
    Record<TabKey, number>
  >({});
  const [selectionStates, setSelectionStates] = useState<
    Record<TabKey, SelectionState>
  >({});
  const [tabOrder, setTabOrder] = useState<TabKey[]>([]);
  const [addressCache, setAddressCache] = useState<AddressCache>({});

  const setEncoding = useCallback((newEncoding: EncodingType) => {
    setEncodingState(newEncoding);
  }, []);

  // 언어+좌표키별로 상태를 관리
  const updateAddressCache = useCallback(
    (
      lang: string,
      lat: string | number,
      lng: string | number,
      state: Partial<AddressCacheState>
    ) => {
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
      const coordKey = `${latNum},${lngNum}`;
      setAddressCache((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [coordKey]: { ...prev[lang]?.[coordKey], ...state },
        },
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

  const deleteTab = useCallback((key: TabKey) => {
    // revoke and remove
    setTabData((prev) => {
      revokeUrlsForTab(prev[key]);
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

  useEffect(() => {
    const currentKeys = Object.keys(tabData);

    const isSame =
      tabOrder.length === currentKeys.length &&
      tabOrder.every((key) => currentKeys.includes(key));

    if (isSame) return;

    setTabOrder((prev) => {
      const validKeys = prev.filter((key) =>
        currentKeys.includes(key as TabKey)
      );
      const newKeys = currentKeys.filter(
        (key) => !prev.includes(key as TabKey)
      ) as TabKey[];
      return [...validKeys, ...newKeys];
    });
  }, [tabData, tabOrder]);

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
    ]
  );

  // === AddressCache Context ===
  const addressCacheContextValue = useMemo(
    () => ({
      addressCache,
      updateAddressCache,
    }),
    [addressCache, updateAddressCache]
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

  // ref to the latest tabData for cleanup on unmount
  const tabDataRef = React.useRef<TabData>(tabData);
  React.useEffect(() => {
    tabDataRef.current = tabData;
  }, [tabData]);

  // helper to revoke any blob URLs associated with tab data
  const revokeUrlsForTab = (data?: TabData[TabKey]) => {
    if (!data) return;
    const thumb = data.exifInfo?.thumbnail;
    if (thumb) {
      try {
        URL.revokeObjectURL(thumb);
      } catch (e) {
        // ignore
      }
    }
  };

  // on provider unmount, revoke any remaining blob URLs
  React.useEffect(() => {
    return () => {
      Object.values(tabDataRef.current).forEach((d) => revokeUrlsForTab(d));
    };
  }, []);

  return (
    <TabContext.Provider value={tabContextValue}>
      <AddressCacheContext.Provider value={addressCacheContextValue}>
        <ScrollContext.Provider value={scrollContextValue}>
          <SelectionContext.Provider value={selectionContextValue}>
            {children}
          </SelectionContext.Provider>
        </ScrollContext.Provider>
      </AddressCacheContext.Provider>
    </TabContext.Provider>
  );
};

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

export const useAddressCache = () => {
  const context = useContext(AddressCacheContext);
  if (!context) {
    throw new Error('useAddressCache must be used within a TabDataProvider');
  }
  return context;
};
