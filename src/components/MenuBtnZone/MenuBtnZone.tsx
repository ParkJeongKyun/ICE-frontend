'use client';

import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from 'react';
import styled from 'styled-components';
import { useTranslations, useLocale } from 'next-intl';
import MenuBtn from '@/components/common/MenuBtn/MenuBtn';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { useShowIp } from '@/hooks/useShowIp';
import { Link } from '@/locales/routing';
import SettingsModal from '@/components/SettingsModal/SettingsModal';

export interface MenuBtnZoneRef {
  openBtnClick: () => void;
  docsBtnClick: () => void;
  aboutBtnClick: () => void;
}

const MenuBtnZone: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { setMenuBtnZoneRef, openModal } = useRefs();
  const { processFile } = useFileProcessor();
  const { showIp } = useShowIp();
  const { isAnalysisProcessing } = useProcess();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const handleOpenClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleToolsMenuItemClick = useCallback(
    (action: string) => {
      setShowToolsMenu(false);
      if (action === 'show-ip') {
        showIp();
      }
    },
    [showIp]
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await processFile(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [processFile]
  );

  const handleDocsClick = useCallback(() => {
    window.open(`/${locale}/docs`, '_blank');
  }, [locale]);

  const menuMethods = useMemo(
    () => ({
      openBtnClick: handleOpenClick,
      docsBtnClick: handleDocsClick,
      aboutBtnClick: () => openModal('about'),
    }),
    [handleOpenClick, handleDocsClick, openModal]
  );

  useEffect(() => {
    if (setMenuBtnZoneRef) {
      setMenuBtnZoneRef(menuMethods);
      return () => setMenuBtnZoneRef(null);
    }
    return undefined;
  }, [setMenuBtnZoneRef, menuMethods]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setShowToolsMenu(false);
      }
    };

    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showToolsMenu]);

  return (
    <Div>
      <MenuBtn
        onClick={handleOpenClick}
        text={t('menu.open')}
        disabled={isAnalysisProcessing}
        disabledTxt={t('menu.fileProcessing')}
      />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      <ToolsMenuContainer ref={toolsMenuRef}>
        <MenuBtn
          onClick={() => setShowToolsMenu(!showToolsMenu)}
          text={t('menu.tools')}
        />
        {showToolsMenu && (
          <ToolsDropdownMenu>
            <ToolsMenuList>
              <ToolsMenuItem
                onClick={() => handleToolsMenuItemClick('show-ip')}
              >
                {t('menu.showIp')}
              </ToolsMenuItem>

              <ToolsMenuItem style={{ padding: 0 }}>
                <StyledLink
                  href="/linknote"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowToolsMenu(false)}
                >
                  {t('menu.linknote')}
                </StyledLink>
              </ToolsMenuItem>
            </ToolsMenuList>
          </ToolsDropdownMenu>
        )}
      </ToolsMenuContainer>

      <Link
        href="/docs"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <MenuBtn onClick={() => {}} text={t('menu.docs')} />
      </Link>

      <MenuBtn onClick={() => openModal('about')} text={t('menu.about')} />
      <SettingsModal />
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  user-select: none;
  flex-shrink: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const ToolsMenuContainer = styled.div`
  position: relative;
`;

const ToolsDropdownMenu = styled.div`
  position: absolute;
  top: calc(100%);
  left: 0;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  min-width: 120px;
  border-radius: 4px;
  padding: 0;
  user-select: none;
  outline: none;
`;

const ToolsMenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 5px 5px;
`;

const ToolsMenuItem = styled.li`
  cursor: pointer;
  color: var(--main-color);
  background: transparent;
  font-size: 0.75rem;
  text-align: left;
  border-radius: 3px;
  transition: all 0.15s ease;

  padding: ${(props) =>
    props.style?.padding !== undefined ? props.style.padding : '3px 12px'};

  &:hover {
    background: var(--main-hover-color);
    color: var(--ice-main-color);
  }
`;

const StyledLink = styled(Link)`
  display: block;
  width: 100%;
  height: 100%;
  padding: 3px 12px;
  text-decoration: none;
  color: inherit;
`;

export default React.memo(MenuBtnZone);
