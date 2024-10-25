import { ExifRow, fileinfo, TabKey } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useRef,
} from 'react';

interface TabData {
  [key: TabKey]: {
    fileinfo: fileinfo;
    thumbnail: string;
    location: { lat: string; lng: string; address: string };
    rows: ExifRow[] | null;
    buffer: Uint8Array;
  };
}

// 컨텍스트 생성
interface TabDataContextType {
  tabData: TabData;
  setTabData: Dispatch<SetStateAction<TabData>>;
  activeKey: TabKey;
  setActiveKey: Dispatch<SetStateAction<TabKey>>;
  getNewKey: () => TabKey;
}

const TabDataContext = createContext<TabDataContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export const TabDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabData, setTabData] = useState<TabData>({});
  const [activeKey, setActiveKey] = useState<TabKey>(0);
  const newTabIndex = useRef(0);

  const getNewKey = (): TabKey => {
    newTabIndex.current += 1;
    return newTabIndex.current as TabKey;
  };

  return (
    <TabDataContext.Provider
      value={{ tabData, setTabData, activeKey, setActiveKey, getNewKey }}
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
