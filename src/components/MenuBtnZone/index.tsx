import React, { useEffect, useCallback } from 'react';
import { ChangeEvent, Ref, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';
import MenuBtn from '@/components/common/MenuBtn';
import HexViewer, { HexViewerRef } from '@/components/HexViewer';
import { useProcess } from '@/contexts/ProcessContext';
import { useTabData } from '@/contexts/TabDataContext';
import { parseExifData, readFileForExif } from '@/utils/exifParser';
import { useWorker } from '@/contexts/WorkerContext';
import { useMessage } from '@/contexts/MessageContext';

interface Props {
  hexViewerRef: Ref<HexViewerRef>;
  openModal: (key: string) => void;
}

export interface MenuBtnZoneRef {
  openBtnClick: () => void;
  helpBtnClick: () => void;
  aboutBtnClick: () => void;
}

const EXIF_TIMEOUT = 30000;

const MenuBtnZone: React.ForwardRefRenderFunction<MenuBtnZoneRef, Props> = (
  { hexViewerRef, openModal },
  ref
) => {
  const { showError } = useMessage();
  const { setTabData, setActiveKey, getNewKey } = useTabData();
  const { fileWorker, isWasmReady } = useWorker();
  const { startProcessing, stopProcessing, isProcessing } = useProcess();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const handleOpenClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleToolsMenuItemClick = useCallback((action: string) => {
    setShowToolsMenu(false);
    if (action === 'linknote') {
      window.open('/linknote', '_blank');
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!fileWorker) {
        showError('WORKER_NOT_INITIALIZED');
        return;
      }

      if (!isWasmReady) {
        showError('WASM_LOADING');
        return;
      }

      if (isProcessing) {
        showError('FILE_PROCESSING_FAILED', '이미 파일 처리 중입니다.');
        return;
      }

      startProcessing();

      try {
        const arrayBuffer = await readFileForExif(file);
        const exifBuffer = new Uint8Array(arrayBuffer);
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

        if (result.error) {
          throw new Error(result.error);
        }

        const { rows, thumbnail, location } = await parseExifData(
          result.exif_data || '[]',
          file,
          result.mime_type
        );

        setTabData((prevDatas) => ({
          ...prevDatas,
          [newActiveKey]: {
            window: {
              label: file.name,
              contents: <HexViewer ref={hexViewerRef} />,
            },
            fileinfo: {
              name: file.name,
              lastModified: file.lastModified,
              size: file.size,
              mime_type: result.mime_type,
              extension: result.extension,
            },
            location,
            thumbnail,
            rows,
            file,
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
          showError('EXIF_PROCESSING_TIMEOUT');
        } else {
          showError('FILE_PROCESSING_FAILED', errorMessage);
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
      showError,
      startProcessing,
      stopProcessing,
      getNewKey,
      setTabData,
      setActiveKey,
      hexViewerRef,
    ]
  );

  useImperativeHandle(
    ref,
    () => ({
      openBtnClick: handleOpenClick,
      helpBtnClick: () => openModal('help'),
      aboutBtnClick: () => openModal('about'),
    }),
    [handleOpenClick, openModal]
  );

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
        text="Open"
        disabled={isProcessing}
        disabledTxt="파일 처리 중입니다"
      />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      <ToolsMenuContainer ref={toolsMenuRef}>
        <MenuBtn
          onClick={() => setShowToolsMenu(!showToolsMenu)}
          text="Tools"
        />
        {showToolsMenu && (
          <ToolsDropdownMenu>
            <ToolsMenuList>
              <ToolsMenuItem
                onClick={() => handleToolsMenuItemClick('linknote')}
              >
                LinkNote
              </ToolsMenuItem>
            </ToolsMenuList>
          </ToolsDropdownMenu>
        )}
      </ToolsMenuContainer>
      <MenuBtn onClick={() => openModal('help')} text="Help" />
      <MenuBtn onClick={() => openModal('about')} text="About" />
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  user-select: none;
  flex: 1;
  min-width: 0;
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
  z-index: 900;
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

export default React.memo(React.forwardRef(MenuBtnZone));
