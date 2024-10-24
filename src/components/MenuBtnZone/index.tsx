import React from 'react';
import { ChangeEvent, Ref, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import MenuBtn from '@/components/common/MenuBtn';
import HexViewer, { HexViewerRef } from '@/components/HexViewer';
import { ExifRow, TabData, TabItem, TabKey } from '@/types';
import { getAddress, isValidLocation } from '@/utils/getAddress';
import { useProcess } from '@/contexts/ProcessContext';

interface Props {
  hexViewerRef: Ref<HexViewerRef>;
  newTabIndex: React.MutableRefObject<number>;
  setDatas: React.Dispatch<React.SetStateAction<TabData>>;
  setItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
  openModal: (key: string) => void;
}

export interface MenuBtnZoneRef {
  openBtnClick: () => void;
  helpBtnClick: () => void;
  aboutBtnClick: () => void;
}

const MenuBtnZone: React.ForwardRefRenderFunction<MenuBtnZoneRef, Props> = (
  { hexViewerRef, newTabIndex, setDatas, setItems, setActiveKey, openModal },
  ref
) => {
  // 처리중인 파일 정보
  const { processInfo, setProcessInfo } = useProcess();
  const { isProcessing } = processInfo;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 클릭 이벤트를 트리거하여 파일 선택 다이얼로그 열기
    }
  };

  const handleHelpClick = () => {
    openModal('help');
  };

  const handleAboutClick = () => {
    openModal('about');
  };

  // 탭을 추가하고 데이터를 저장하는 함수
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessInfo({ fileName: file.name, isProcessing: true });
      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result instanceof ArrayBuffer) {
              resolve(event.target.result);
            } else {
              reject(new Error('Failed to read file as ArrayBuffer'));
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsArrayBuffer(file);
        });
      };

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        let parsedRows: ExifRow[] | null = null;
        let thumbnail: string = '';
        let lat: string = 'NaN';
        let lng: string = 'NaN';
        let address: string = '';

        const newActiveKey = newTabIndex.current++;
        const newTab = {
          label: file.name,
          children: (
            <>
              {arrayBuffer && (
                <HexViewer arrayBuffer={arrayBuffer} ref={hexViewerRef} />
              )}
            </>
          ),
          key: newActiveKey,
        };
        setItems((prev) => [...prev, newTab]);
        setActiveKey(newActiveKey);

        const input_data = new Uint8Array(arrayBuffer);
        const result = await window.goFunc(input_data);
        if (result.error) {
          console.error(result);
        }
        if (result.exif_data) {
          const meta: [
            {
              tag: string;
              comment: string;
              data: string;
              origindata: string;
              type: string;
              name: string;
              unit: string;
              example: any;
            },
          ] = JSON.parse(result.exif_data);

          if (meta) {
            parsedRows = await Promise.all(
              meta.map(
                async (
                  { tag, comment, data, origindata, name, type, unit, example },
                  index
                ) => {
                  if (tag === 'Location') {
                    try {
                      [lat, lng] = origindata
                        .split(',')
                        .map((value) => value.trim());
                      if (isValidLocation(lat, lng)) {
                        address = await getAddress(lat, lng);
                        data = address;
                      }
                    } catch (error_msg) {
                      console.log(error_msg);
                    }
                  }
                  return {
                    id: index + 1,
                    meta: tag,
                    comment,
                    data,
                    origindata,
                    name,
                    type,
                    unit,
                    example,
                  };
                }
              )
            );
          }
        }

        if (result.mime_type?.startsWith('image')) {
          thumbnail = URL.createObjectURL(file);
        }

        setDatas(
          (prevDatas) =>
            new Map(
              prevDatas.set(newActiveKey, {
                fileinfo: {
                  name: file.name,
                  lastModified: file.lastModified,
                  size: file.size,
                  mime_type: result.mime_type,
                  extension: result.extension,
                },
                location: {
                  lat: lat,
                  lng: lng,
                  address: address,
                },
                thumbnail: thumbnail,
                rows: parsedRows,
                buffer: arrayBuffer,
              })
            )
        );
      } catch (error) {
        console.error('Error reading file:', error);
      } finally {
        setProcessInfo({ isProcessing: false });
      }

      // 파일 선택 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // value를 빈 문자열("")로 설정하여 초기화합니다.
      }
    }
  };

  // 상위 컴포넌트에게 전달할 함수
  useImperativeHandle(ref, () => {
    const openBtnClick = (): void => {
      handleOpenClick();
    };

    const helpBtnClick = (): void => {
      handleHelpClick();
    };

    const aboutBtnClick = (): void => {
      handleAboutClick();
    };

    return {
      openBtnClick,
      helpBtnClick,
      aboutBtnClick,
    };
  });

  return (
    <Div>
      {/* 파일 업로드 */}
      <MenuBtn
        onClick={handleOpenClick}
        text="Open"
        disabled={isProcessing}
        disabledTxt="파일 분석이 완료되면 시도해주세요"
      />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      <MenuBtn
        onClick={() => {}}
        text="Save"
        disabled
        disabledTxt="기능 추가 업데이트 예정"
      />
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
