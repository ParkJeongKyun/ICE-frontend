import HexViewer from 'components/HexViewer';
import { ChangeEvent, useRef } from 'react';
import styled from 'styled-components';
import MenuBtn from '../common/MenuBtn';
import { ExifRow, TabData, TabItem, TabKey } from 'types';
import { getAddress, isValidLocation } from 'utils/getAddress';

interface Props {
  newTabIndex: React.MutableRefObject<number>;
  setDatas: React.Dispatch<React.SetStateAction<TabData>>;
  setItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
  setActiveKey: React.Dispatch<React.SetStateAction<TabKey>>;
}

const MenuBtnZone: React.FC<Props> = ({
  newTabIndex,
  setDatas,
  setItems,
  setActiveKey,
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
        if (arrayBuffer instanceof ArrayBuffer) {
          const newActiveKey = newTabIndex.current++;
          const newTab = {
            label: file.name,
            children: (
              <>{arrayBuffer && <HexViewer arrayBuffer={arrayBuffer} />}</>
            ),
            key: newActiveKey,
          };
          setItems((prev) => [...prev, newTab]);
          setActiveKey(newActiveKey);

          if (file.type.startsWith('image/')) {
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
                          const [lat, lng] = origindata
                            .split(',')
                            .map((value) => value.trim());
                          if (isValidLocation(lat, lng)) {
                            const address = await getAddress(lat, lng);
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
      <MenuBtn onClick={() => {}} text="Save" disabled />
      <MenuBtn onClick={() => {}} text="Help" disabled />
      <MenuBtn onClick={() => {}} text="About" />
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