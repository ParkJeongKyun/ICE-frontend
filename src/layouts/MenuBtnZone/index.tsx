import HexViewer from 'components/common/HexViewer';
import { TabData, TabItem, TabKey } from 'layouts';
import { ChangeEvent, useRef } from 'react';
import styled from 'styled-components';
import MenuBtn from './MenuBtn';

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result;
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

          const input_data = new Uint8Array(arrayBuffer);
          const result = await window.goFunc(input_data);

          if (!result) {
            return;
          }

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

          const parsedRows = await Promise.all(
            meta.map(
              async (
                { tag, comment, data, origindata, name, type, unit, example },
                index
              ) => {
                if (tag === 'Location') {
                  try {
                    const [lat, lng] = origindata
                      .split(',')
                      .map((value) => value.trim());
                    // if (isValidLocation(lat, lng)) {
                    //   const address = await getAddress(lat, lng);
                    //   data = address;
                    // }
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

          setDatas(
            (prevDatas) =>
              new Map(
                prevDatas.set(newActiveKey, {
                  rows: parsedRows,
                  buffer: arrayBuffer,
                })
              )
          );
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Div>
      {/* 파일 업로드 */}
      <MenuBtn onClick={handleOpenClick} text="Open" />
      <FileInput type="file" ref={fileInputRef} onChange={handleFileChange} />
      <MenuBtn onClick={() => {}} text="Save" />
      <MenuBtn onClick={() => {}} text="Help" />
      <MenuBtn onClick={() => {}} text="About" />
    </Div>
  );
};

const Div = styled.div`
  display: flex;
  gap: 10px;
`;

const FileInput = styled.input`
  display: none;
`;

export default MenuBtnZone;
