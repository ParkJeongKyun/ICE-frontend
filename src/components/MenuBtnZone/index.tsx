import React from 'react';
import { ChangeEvent, Ref, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import MenuBtn from '@/components/common/MenuBtn';
import HexViewer, { HexViewerRef } from '@/components/HexViewer';
import { ExifRow } from '@/types';
import { getAddress, isValidLocation } from '@/utils/getAddress';
import { ProcessStatus, useProcess } from '@/contexts/ProcessContext';
import { useTabData } from '@/contexts/TabDataContext';

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
  // 처리중인 파일 정보
  const { setProcessInfo, isProcessing } = useProcess();

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
    let status: ProcessStatus = 'success';
    let message = '';
    if (file) {
      setProcessInfo({
        fileName: file.name,
        status: 'processing',
        message: '',
      });
      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        // EXIF는 파일 앞/끝부분(각 256KB)에서 주로 발견됨. 파일이 512KB 미만이면 전체를 읽음
        const EXIF_READ_SIZE = 256 * 1024; // 256KB
        return new Promise((resolve, reject) => {
          if (file.size <= EXIF_READ_SIZE * 2) {
            // 파일이 512KB 이하라면 전체 파일 읽기
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
          } else {
            // 앞 256KB + 끝 256KB 읽어서 합침
            const headBlob = file.slice(0, EXIF_READ_SIZE);
            const tailBlob = file.slice(file.size - EXIF_READ_SIZE, file.size);
            const headReader = new FileReader();
            const tailReader = new FileReader();
            let headBuffer: ArrayBuffer | null = null;
            let tailBuffer: ArrayBuffer | null = null;

            headReader.onload = () => {
              if (headReader.result instanceof ArrayBuffer) {
                headBuffer = headReader.result;
                if (tailBuffer) {
                  // 둘 다 읽었으면 합쳐서 반환
                  const total = new Uint8Array(EXIF_READ_SIZE * 2);
                  total.set(new Uint8Array(headBuffer), 0);
                  total.set(new Uint8Array(tailBuffer), EXIF_READ_SIZE);
                  resolve(total.buffer);
                }
              } else {
                reject(new Error('Failed to read file head as ArrayBuffer'));
              }
            };
            tailReader.onload = () => {
              if (tailReader.result instanceof ArrayBuffer) {
                tailBuffer = tailReader.result;
                if (headBuffer) {
                  // 둘 다 읽었으면 합쳐서 반환
                  const total = new Uint8Array(EXIF_READ_SIZE * 2);
                  total.set(new Uint8Array(headBuffer), 0);
                  total.set(new Uint8Array(tailBuffer), EXIF_READ_SIZE);
                  resolve(total.buffer);
                }
              } else {
                reject(new Error('Failed to read file tail as ArrayBuffer'));
              }
            };
            headReader.onerror = (error) => reject(error);
            tailReader.onerror = (error) => reject(error);
            headReader.readAsArrayBuffer(headBlob);
            tailReader.readAsArrayBuffer(tailBlob);
          }
        });
      };

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const exifBuffer = new Uint8Array(arrayBuffer);
        let parsedRows: ExifRow[] | null = null;
        let thumbnail: string = '';
        let lat: string = 'NaN';
        let lng: string = 'NaN';
        let address: string = '';

        const newActiveKey = getNewKey();
        const newTabWindow = {
          label: file.name,
          contents: (
            <>
              <HexViewer ref={hexViewerRef} />
            </>
          ),
        };
        setActiveKey(newActiveKey);

        const result = await window.goFunc(exifBuffer);
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
            location: {
              lat: lat,
              lng: lng,
              address: address,
            },
            thumbnail: thumbnail,
            rows: parsedRows,
            file: file, // File 객체 저장
          },
        }));
      } catch (error) {
        console.error('Error reading file:', error);
        status = 'failure';
      } finally {
        setProcessInfo({ status: status, message });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
