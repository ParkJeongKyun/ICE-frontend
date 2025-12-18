import React, { useEffect } from 'react';
import { ChangeEvent, Ref, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';
import MenuBtn from '@/components/common/MenuBtn';
import HexViewer, { HexViewerRef } from '@/components/HexViewer';
import { ProcessStatus, useProcess } from '@/contexts/ProcessContext';
import { useTabData } from '@/contexts/TabDataContext';
import { readFileForExif } from '@/utils/fileReader';
import { parseExifData } from '@/utils/exifParser';
import { useWorker } from '@/contexts/WorkerContext';

interface Props {
  hexViewerRef: Ref<HexViewerRef>;
  openModal: (key: string) => void;
}

export interface MenuBtnZoneRef {
  openBtnClick: () => void;
  helpBtnClick: () => void;
  aboutBtnClick: () => void;
}

const MenuBtnZone: React.ForwardRefRenderFunction<MenuBtnZoneRef, Props> = (
  { hexViewerRef, openModal },
  ref
) => {
  const { setTabData, setActiveKey, getNewKey } = useTabData();
  const { fileWorker, isWasmReady } = useWorker();
  const { setProcessInfo, isProcessing } = useProcess();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleHelpClick = () => {
    openModal('help');
  };

  const handleAboutClick = () => {
    openModal('about');
  };

  const handleToolsClick = () => {
    setShowToolsMenu(!showToolsMenu);
  };

  const handleToolsMenuItemClick = (action: string) => {
    setShowToolsMenu(false);

    switch (action) {
      case 'linknote':
        window.open('/linknote', '_blank');
        break;
      // 추가 기능은 여기에
      default:
        break;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ 개발 모드에서만 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('[MenuBtnZone] File selected:', file.name);
      console.log('[MenuBtnZone] WASM Ready:', isWasmReady);
    }

    if (!fileWorker) {
      alert('워커가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    if (!isWasmReady) {
      alert(
        'WASM이 로딩 중입니다. 잠시 후 다시 시도해주세요.\n(약 1-2초 소요)'
      );
      return;
    }

    let status: ProcessStatus = 'success';
    let message = '';

    setProcessInfo({
      fileName: file.name,
      status: 'processing',
      message: '',
    });

    try {
      const arrayBuffer = await readFileForExif(file);
      const exifBuffer = new Uint8Array(arrayBuffer);
      const newActiveKey = getNewKey();

      const newTabWindow = {
        label: file.name,
        contents: <HexViewer ref={hexViewerRef} />,
      };

      const result = await new Promise<any>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('EXIF 처리 타임아웃'));
        }, 30000);

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
        fileWorker.postMessage({ type: 'PROCESS_EXIF', imageData: exifBuffer });
      });

      if (result.error) {
        status = 'failure';
        message = result.error;
      }

      const { rows, thumbnail, location } = await parseExifData(
        result.exif_data || '[]',
        file,
        result.mime_type
      );

      setTabData((prevDatas) => ({
        ...prevDatas,
        [newActiveKey]: {
          window: newTabWindow,
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
      status = 'failure';
      message = error instanceof Error ? error.message : '알 수 없는 오류';
    } finally {
      setProcessInfo({ status, message });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useImperativeHandle(ref, () => ({
    openBtnClick: handleOpenClick,
    helpBtnClick: handleHelpClick,
    aboutBtnClick: handleAboutClick,
  }));

  // 메뉴 외부 클릭 감지
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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsMenu]);

  return (
    <Div>
      <MenuBtn
        onClick={handleOpenClick}
        text="Open"
        disabled={isProcessing}
        disabledTxt="파일 분석이 완료되면 시도해주세요"
      />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      <ToolsMenuContainer ref={toolsMenuRef}>
        <MenuBtn onClick={handleToolsClick} text="Tools" />
        {showToolsMenu && (
          <ToolsDropdownMenu>
            <ToolsMenuList>
              <ToolsMenuItem
                onClick={() => handleToolsMenuItemClick('linknote')}
              >
                LinkNote
              </ToolsMenuItem>
              {/* 추가 메뉴 아이템 */}
            </ToolsMenuList>
          </ToolsDropdownMenu>
        )}
      </ToolsMenuContainer>
      <MenuBtn onClick={handleHelpClick} text="Help" />
      <MenuBtn onClick={handleAboutClick} text="About" />
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  user-select: none;
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
  z-index: 999;
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

export default React.forwardRef(MenuBtnZone);
