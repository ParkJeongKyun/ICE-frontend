'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { ChangeEvent, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import MenuBtn from '@/components/common/MenuBtn/MenuBtn';
import HexViewer from '@/components/HexViewer/HexViewer';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import { useRefs } from '@/contexts/RefContext/RefContext';
import { parseExifData, readFileForExif } from '@/utils/exifParser';
import { useWorker } from '@/contexts/WorkerContext/WorkerContext';
import { getClientIp } from '@/utils/getClientIp';
import eventBus from '@/utils/eventBus';

export interface MenuBtnZoneRef {
  openBtnClick: () => void;
  helpBtnClick: () => void;
  aboutBtnClick: () => void;
}

const EXIF_TIMEOUT = 30000;

const MenuBtnZone: React.FC = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { hexViewerRef, setMenuBtnZoneRef, openModal } = useRefs();
  const { setTabData, setActiveKey, getNewKey } = useTab();
  const { fileWorker, isWasmReady } = useWorker();
  const { startProcessing, stopProcessing, isProcessing } = useProcess();
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
        // 현재 로케일 추출 (예: /ko/home → 'ko', /en/home → 'en')
        const locale = pathname.split('/')[1] || 'en';
        window.open(`/${locale}/linknote`, '_blank');
      } else if (action === 'show-ip') {
        handleShowIP();
      }
    },
    [pathname]
  );

  const handleShowIP = useCallback(async () => {
    try {
      const ipInfo = await getClientIp();

      // 정보 키와 값의 매핑
      const infoMapping = [
        { key: 'ipInfo.address', value: ipInfo.ip },
        { key: 'ipInfo.hostname', value: ipInfo.hostname },
        { key: 'ipInfo.city', value: ipInfo.city },
        { key: 'ipInfo.region', value: ipInfo.region },
        { key: 'ipInfo.country', value: ipInfo.country },
        { key: 'ipInfo.location', value: ipInfo.loc },
        { key: 'ipInfo.organization', value: ipInfo.org },
        { key: 'ipInfo.timezone', value: ipInfo.timezone },
      ];

      // 값이 있는 것만 필터링하고 포맷팅
      const infoText = infoMapping
        .filter(({ value }) => value)
        .map(({ key, value }) => `${t(key)}: ${value}`)
        .join('\n');

      eventBus.emit('toast', {
        code: 'IP_FETCH_SUCCESS',
        customMessage: infoText,
      });

      // IP만 클립보드에 복사
      await navigator.clipboard.writeText(ipInfo.ip);
      eventBus.emit('toast', { code: 'IP_COPIED' });
    } catch (error) {
      console.error('[MenuBtnZone] IP fetch failed:', error);
      eventBus.emit('toast', { code: 'IP_FETCH_FAILED' });
    }
  }, [t]);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!fileWorker) {
        eventBus.emit('toast', { code: 'WORKER_NOT_INITIALIZED' });
        return;
      }

      if (!isWasmReady) {
        eventBus.emit('toast', { code: 'WASM_LOADING' });
        return;
      }

      if (isProcessing) {
        eventBus.emit('toast', {
          code: 'FILE_PROCESSING_FAILED',
          customMessage: t('home.processing'),
        });
        return;
      }

      startProcessing();

      try {
        const { buffer } = await readFileForExif(file);
        const exifBuffer = new Uint8Array(buffer);
        const newActiveKey = getNewKey();

        const result = await new Promise<any>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('EXIF_PROCESSING_TIMEOUT'));
          }, EXIF_TIMEOUT);

          const handler = (e: MessageEvent) => {
            if (e.data.type === 'EXIF_RESULT') {
              clearTimeout(timeoutId);
              fileWorker.removeEventListener('message', handler);
              resolve(e.data.result);
            } else if (e.data.type === 'EXIF_ERROR') {
              clearTimeout(timeoutId);
              fileWorker.removeEventListener('message', handler);
              reject(new Error(e.data.error));
            }
          };

          fileWorker.addEventListener('message', handler);
          fileWorker.postMessage({
            type: 'PROCESS_EXIF',
            imageData: exifBuffer,
          });
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('EXIF processing result:', result);
        }

        if (result.error) {
          throw new Error(result.error);
        }

        const {
          tagInfos,
          thumbnail,
          location,
          baseOffset,
          byteOrder,
          firstIfdOffset,
          ifdInfos,
        } = await parseExifData(result.exifData || '[]', file, result.mimeType);

        setTabData((prevDatas) => ({
          ...prevDatas,
          [newActiveKey]: {
            window: {
              label: file.name,
              contents: <HexViewer ref={hexViewerRef} />,
            },
            file,
            fileInfo: {
              name: file.name,
              lastModified: file.lastModified,
              size: file.size,
              mimeType: result.mimeType,
              extension: result.extension,
            },
            hasExif: result.hasExif || false,
            exifInfo: {
              location,
              thumbnail,
              tagInfos,
              byteOrder,
              firstIfdOffset,
              ifdInfos,
              baseOffset,
            },
          },
        }));

        setActiveKey(newActiveKey);
      } catch (error) {
        console.error('[MenuBtnZone] File processing failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류';

        if (
          error instanceof Error &&
          error.message === 'EXIF_PROCESSING_TIMEOUT'
        ) {
          eventBus.emit('toast', { code: 'EXIF_PROCESSING_TIMEOUT' });
        } else {
          eventBus.emit('toast', {
            code: 'FILE_PROCESSING_FAILED',
            customMessage: errorMessage,
          });
        }
      } finally {
        stopProcessing();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [
      fileWorker,
      isWasmReady,
      isProcessing,
      startProcessing,
      stopProcessing,
      getNewKey,
      setTabData,
      setActiveKey,
      hexViewerRef,
    ]
  );

  // Register methods into RefContext so parents can use without passing ref
  const menuMethods = useMemo(
    () => ({
      openBtnClick: handleOpenClick,
      helpBtnClick: () => openModal('help'),
      aboutBtnClick: () => openModal('about'),
    }),
    [handleOpenClick, openModal]
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
        disabled={isProcessing}
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
                onClick={() => handleToolsMenuItemClick('linknote')}
              >
                {t('menu.linknote')}
              </ToolsMenuItem>
              <ToolsMenuItem
                onClick={() => handleToolsMenuItemClick('show-ip')}
              >
                {t('menu.showIp')}
              </ToolsMenuItem>
            </ToolsMenuList>
          </ToolsDropdownMenu>
        )}
      </ToolsMenuContainer>
      <MenuBtn onClick={() => openModal('help')} text={t('menu.help')} />
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
