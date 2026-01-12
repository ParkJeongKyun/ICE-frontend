import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { HexViewerRef } from '@/components/HexViewer';
import { SearcherRef } from '@/components/Searcher';
import { MenuBtnZoneRef } from '@/components/MenuBtnZone';

interface RefContextType {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
  searcherRef: React.RefObject<SearcherRef | null>;
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef | null>;
}

const RefContext = createContext<RefContextType | undefined>(undefined);

export const RefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const hexViewerRef = useRef<HexViewerRef | null>(null);
  const searcherRef = useRef<SearcherRef | null>(null);
  const menuBtnZoneRef = useRef<MenuBtnZoneRef | null>(null);

  return (
    <RefContext.Provider value={{ hexViewerRef, searcherRef, menuBtnZoneRef }}>
      {children}
    </RefContext.Provider>
  );
};

export const useRefs = (): RefContextType => {
  const context = useContext(RefContext);
  if (!context) {
    throw new Error('useRefs must be used within RefProvider');
  }
  return context;
};
