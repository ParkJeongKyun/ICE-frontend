import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { HexViewerRef } from '@/components/HexViewer';
import { MenuBtnZoneRef } from '@/components/MenuBtnZone';

interface RefContextType {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef | null>;
}

const RefContext = createContext<RefContextType | undefined>(undefined);

export const RefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const hexViewerRef = useRef<HexViewerRef | null>(null);
  const menuBtnZoneRef = useRef<MenuBtnZoneRef | null>(null);

  return (
    <RefContext.Provider value={{ hexViewerRef, menuBtnZoneRef }}>
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
