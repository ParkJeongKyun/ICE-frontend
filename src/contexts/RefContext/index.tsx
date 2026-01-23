import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { HexViewerRef } from '@/components/HexViewer';
import { SearcherRef } from '@/components/Searcher';
import { MenuBtnZoneRef } from '@/components/MenuBtnZone';
import type { ModalRef } from '@/components/common/Modal';

interface RefContextType {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
  searcherRef: React.RefObject<SearcherRef | null>;
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef | null>;
  modalRef: React.RefObject<ModalRef | null>;
  setSearcherRef: (ref: SearcherRef | null) => void;
  setMenuBtnZoneRef: (ref: MenuBtnZoneRef | null) => void;
  setModalRef: (ref: ModalRef | null) => void;
}

const RefContext = createContext<RefContextType | undefined>(undefined);

export const RefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const hexViewerRef = useRef<HexViewerRef | null>(null);
  const searcherRef = useRef<SearcherRef | null>(null);
  const menuBtnZoneRef = useRef<MenuBtnZoneRef | null>(null);
  const modalRef = useRef<ModalRef | null>(null);

  const setSearcherRef = (r: SearcherRef | null) => {
    searcherRef.current = r;
  };

  const setMenuBtnZoneRef = (r: MenuBtnZoneRef | null) => {
    menuBtnZoneRef.current = r;
  };

  const setModalRef = (r: ModalRef | null) => {
    modalRef.current = r;
  };

  return (
    <RefContext.Provider value={{ hexViewerRef, searcherRef, menuBtnZoneRef, modalRef, setSearcherRef, setMenuBtnZoneRef, setModalRef }}>
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
