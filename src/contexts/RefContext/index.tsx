import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { HexViewerRef } from '@/components/HexViewer';
import { SearcherRef } from '@/components/Searcher';
import { MenuBtnZoneRef } from '@/components/MenuBtnZone';
import type { ModalRef } from '@/components/common/Modal';
import AboutMD from '@/components/markdown/AboutMD';
import HelpMD from '@/components/markdown/HelpMD';

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
  const { t } = useTranslation();
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

  const modalData = useMemo(
    () => ({
      about: [t('menu.about'), <AboutMD key="about" />],
      help: [t('menu.help'), <HelpMD key="help" />],
    }),
    [t]
  );

  const openModal = (key: string) => {
    const data = modalData[key as keyof typeof modalData];
    if (!data) return;
    const titleNode = <b key="title">{data[0]}</b>;
    const contentNode = data[1];
    modalRef.current?.open(titleNode, contentNode);
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
