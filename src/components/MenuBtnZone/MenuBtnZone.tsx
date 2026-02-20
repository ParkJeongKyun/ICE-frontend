'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { ChangeEvent, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslations, useLocale } from 'next-intl';
import MenuBtn from '@/components/common/MenuBtn/MenuBtn';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { useShowIp } from '@/hooks/useShowIp';

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
      if (action === 'linknote') {
        // useLocale을 사용해 로케일을 구합니다
        window.open(`/${locale}/linknote`, '_blank');
      } else if (action === 'show-ip') {
        showIp();
      }
    },
    [locale, showIp]
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 파일 처리는 훅에게 위임 (비즈니스 로직 분리)
      await processFile(file);

      // 파일 인풋 초기화 로직은 UI 컴포넌트의 책임이므로 여기에 남김
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [processFile]
  );

  const handleDocsClick = useCallback(() => {
    window.open(`/${locale}/docs`, '_blank');
  }, [locale]);

  // Register methods into RefContext so parents can use without passing ref
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
              <ToolsMenuItem
                onClick={() => handleToolsMenuItemClick('linknote')}
              >
                {t('menu.linknote')}
              </ToolsMenuItem>
            </ToolsMenuList>
          </ToolsDropdownMenu>
        )}
      </ToolsMenuContainer>
      <MenuBtn onClick={handleDocsClick} text={t('menu.docs')} />
      <MenuBtn onClick={() => openModal('about')} text={t('menu.about')} />
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
  padding: 3px 12px;
  cursor: pointer;
  color: var(--main-color);
  background: transparent;
  font-size: 0.75rem;
  text-align: left;
  border-radius: 3px;
  transition: all 0.15s ease;

  &:hover {
    background: var(--main-hover-color);
    color: var(--ice-main-color);
  }
`;

export default React.memo(MenuBtnZone);
