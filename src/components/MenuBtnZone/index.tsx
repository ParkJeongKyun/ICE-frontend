import React, { useEffect } from 'react';
import { ChangeEvent, Ref, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';
import MenuBtn from '@/components/common/MenuBtn';
import HexViewer, { HexViewerRef } from '@/components/HexViewer';
import { ProcessStatus, useProcess } from '@/contexts/ProcessContext';
import { useTabData } from '@/contexts/TabDataContext';
import { readFileForExif } from '@/utils/fileReader';
import { parseExifData } from '@/utils/exifParser';

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

    let status: ProcessStatus = 'success';
    let message = '';

    setProcessInfo({
      fileName: file.name,
      status: 'processing',
      message: '',
    });

    try {
      // ✅ 유틸리티 사용: 파일 읽기
      const arrayBuffer = await readFileForExif(file);
      const exifBuffer = new Uint8Array(arrayBuffer);

      // 새 탭 생성
      const newActiveKey = getNewKey();
      const newTabWindow = {
        label: file.name,
        contents: <HexViewer ref={hexViewerRef} />,
      };
      setActiveKey(newActiveKey);

      // Go 함수 호출
      const result = await window.goFunc(exifBuffer);

      if (result.error) {
        console.error(result);
        status = 'failure';
        message = result.error;
      }

      // ✅ 유틸리티 사용: EXIF 파싱
      const { rows, thumbnail, location } = await parseExifData(
        result.exif_data || '[]',
        file,
        result.mime_type
      );

      // 탭 데이터 저장
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
    } catch (error) {
      console.error('파일 처리 실패:', error);
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
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
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
              <ToolsMenuItem onClick={() => handleToolsMenuItemClick('linknote')}>
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
