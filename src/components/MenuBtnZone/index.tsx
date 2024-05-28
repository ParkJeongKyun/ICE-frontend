import HexViewer, { HexViewerRef } from 'components/HexViewer';
import { ChangeEvent, Ref, useRef } from 'react';
import styled from 'styled-components';
import MenuBtn from '../common/MenuBtn';
import { ExifRow, TabData, TabItem, TabKey } from 'types';
import { getAddress, isValidLocation } from 'utils/getAddress';
import Tooltip from 'components/common/Tooltip';

interface Props {
  hexViewerRef: Ref<HexViewerRef>;
  newTabIndex: React.MutableRefObject<number>;
  setDatas: React.Dispatch<React.SetStateAction<TabData>>;
  setItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
  openModal: (key: string) => void;
}

const MenuBtnZone: React.FC<Props> = ({
  hexViewerRef,
  newTabIndex,
  setDatas,
  setItems,
  setActiveKey,
  openModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 클릭 이벤트를 트리거하여 파일 선택 다이얼로그 열기
    }
  };

  // 탭을 추가하고 데이터를 저장하는 함수
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result;
        let parsedRows: ExifRow[] | null = null;
        let thumbnail: string = '';
        let lat: string = 'NaN';
        let lng: string = 'NaN';
        let address: string = '';
        if (arrayBuffer instanceof ArrayBuffer) {
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

          if (file.type.startsWith('image/')) {
            thumbnail = URL.createObjectURL(file);
            const input_data = new Uint8Array(arrayBuffer);
            const result = await window.goFunc(input_data);
            if (result) {
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
              ] = JSON.parse(result);

              if (meta) {
                parsedRows = await Promise.all(
                  meta.map(
                    async (
                      {
                        tag,
                        comment,
                        data,
                        origindata,
                        name,
                        type,
                        unit,
                        example,
                      },
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
          }

          setDatas(
            (prevDatas) =>
              new Map(
                prevDatas.set(newActiveKey, {
                  fileinfo: {
                    name: file.name,
                    lastModified: file.lastModified,
                    size: file.size,
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
        }
      };
      reader.readAsArrayBuffer(file);
      // 파일 선택 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // value를 빈 문자열("")로 설정하여 초기화합니다.
      }
    }
  };

  return (
    <Div>
      {/* 파일 업로드 */}
      <MenuBtn onClick={handleOpenClick} text="Open" />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      <Tooltip text="기능 추가 업데이트 예정">
        <MenuBtn onClick={() => {}} text="Save" disabled />
      </Tooltip>
      <Tooltip text="기능 추가 업데이트 예정">
        <MenuBtn onClick={() => {}} text="Tools" disabled />
      </Tooltip>
      <MenuBtn
        onClick={() => {
          openModal('help');
        }}
        text="Help"
      />
      <MenuBtn
        onClick={() => {
          openModal('about');
        }}
        text="About"
      />
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

export default MenuBtnZone;
