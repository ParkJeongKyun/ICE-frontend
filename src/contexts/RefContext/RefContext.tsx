'use client';
import React, { createContext, useContext, useRef, ReactNode } from 'react';

import { HexViewerRef } from '@/components/HexViewer/HexViewer';
import { SearcherRef } from '@/components/Searcher/Searcher';
import { MenuBtnZoneRef } from '@/components/MenuBtnZone/MenuBtnZone';
import type { ModalRef } from '@/components/common/Modal/Modal';

interface RefContextType {
  hexViewerRef: React.RefObject<HexViewerRef | null>;
  searcherRef: React.RefObject<SearcherRef | null>;
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef | null>;
  modalRef: React.RefObject<ModalRef | null>;
  setSearcherRef: (ref: SearcherRef | null) => void;
  setMenuBtnZoneRef: (ref: MenuBtnZoneRef | null) => void;
  setModalRef: (ref: ModalRef | null) => void;
  openModal: (key: string) => void;
}

const RefContext = createContext<RefContextType | undefined>(undefined);

export const RefProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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

  const openModal = (key: string) => {
    modalRef.current?.open(key);
  };

  return (
    <RefContext.Provider
      value={{
        hexViewerRef,
        searcherRef,
        menuBtnZoneRef,
        modalRef,
        setSearcherRef,
        setMenuBtnZoneRef,
        setModalRef,
        openModal,
      }}
    >
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
