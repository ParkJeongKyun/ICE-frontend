import { TabData, TabKey } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useRef,
  useMemo,
} from 'react';

// 인코딩 타입 정의
export type EncodingType = 'latin1' | 'windows-1252' | 'ascii' | 'utf-8';

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
  const newTabIndex = useRef(0);

  const getNewKey = (): TabKey => {
    newTabIndex.current += 1;
    return `tab-${newTabIndex.current}` as TabKey;
  };

  const activeData = useMemo(() => tabData[activeKey], [tabData, activeKey]);
  const isEmpty = useMemo(() => Object.keys(tabData).length === 0, [tabData]);

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
