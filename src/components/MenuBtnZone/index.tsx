import React from 'react';
import { ChangeEvent, Ref, useImperativeHandle, useRef } from 'react';
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

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleHelpClick = () => {
    openModal('help');
  };

  const handleAboutClick = () => {
    openModal('about');
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

  return (
    <Div>
      <MenuBtn
        onClick={handleOpenClick}
        text="Open"
        disabled={isProcessing}
        disabledTxt="파일 분석이 완료되면 시도해주세요"
      />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      {/* <MenuBtn
        onClick={() => {}}
        text="Save"
        disabled
        disabledTxt="기능 추가 업데이트 예정"
      /> */}
      <MenuBtn
        onClick={() => {}}
        text="Tools"
        disabled
        disabledTxt="기능 추가 업데이트 예정"
      />
      <MenuBtn onClick={handleHelpClick} text="Help" />
      <MenuBtn onClick={handleAboutClick} text="About" />
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 2px;
`;

const FileInput = styled.input`
  display: none;
`;

export default React.forwardRef(MenuBtnZone);
