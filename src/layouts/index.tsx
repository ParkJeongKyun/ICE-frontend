import { IceTabs } from 'components/common/old/IceInfomation/styles';
import BigMenuBtn from './BIgMenuBtn';
import {
  IceContent,
  IceFooter,
  IceHeader,
  IceLayout,
  IceLeftSider,
  IceMainLayout,
  IceRightSider,
  LogoDiv,
  LogoImage,
} from './index.styles';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import HexViewer from 'components/common/HexViewer';
import MetaDataView from 'components/common/MetaDataView';
import { ExifRow } from 'types';
import { getAddress, isValidLocation } from 'utils/getAddress';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface ArrayBufferMap {
  [key: string]: ArrayBuffer;
}

interface ExifRowMap {
  [key: string]: ExifRow[];
}

const MainLayout: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ExifRowMap>({});
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBufferMap>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [items, setItems] = useState<
    { label: string; children: React.ReactNode; key: string }[]
  >([]);
  const newTabIndex = useRef(0);

  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 클릭 이벤트를 트리거하여 파일 선택 다이얼로그 열기
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          const newActiveKey = `newTab${newTabIndex.current++}`;
          const newTab = {
            label: file.name,
            children: (
              <>{arrayBuffer && <HexViewer arrayBuffer={arrayBuffer} />}</>
            ),
            key: newActiveKey,
          };
          setItems([...items, newTab]);
          setActiveKey(newActiveKey);
          setArrayBuffers({ ...arrayBuffers, [newActiveKey]: arrayBuffer });

          if (file.type.startsWith('image/')) {
            // 이미지 파일일 경우에만 처리
            // 예: file.type이 'image/jpeg', 'image/png', 'image/gif' 등인 경우
            // 처리할 내용 작성

            let input_data = new Uint8Array(arrayBuffer);
            // GO 웹 어셈블리 모듈에 입력
            const result = await window.goFunc(input_data);

            // 결과가 없는 경우
            if (!result) {
              return;
            }

            // 메타 데이터 파싱
            const meta: [
              {
                tag: string; // 영문 태그명
                comment: string; // 주석
                data: string; // 데이터
                origindata: string; // 원본 데이터
                type: string; // 타입
                name: string; // 한글 태그명
                unit: string; // 단위
                example: any; // 예제값
              },
            ] = JSON.parse(result);

            setRows({
              ...rows,
              [newActiveKey]: await Promise.all(
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
                      // 좌표(위도, 경도) 데이터 가 있는 경우
                      try {
                        const [lat, lng] = origindata
                          .split(',')
                          .map((value) => value.trim());
                        // if (isValidLocation(lat, lng)) {
                        //   // API로 주소값 얻기
                        //   const address = await getAddress(lat, lng);
                        //   // 주소값으로 변경
                        //   data = address;
                        // }
                      } catch (error_msg) {
                        console.log(error_msg);
                      }
                    }
                    return {
                      id: index + 1,
                      meta: tag,
                      comment: comment,
                      data: data,
                      origindata: origindata,
                      name: name,
                      type: type,
                      unit: unit,
                      example,
                    };
                  }
                )
              ),
            });
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const remove = (targetKey: TargetKey) => {
    const targetIndex = items.findIndex((pane) => pane.key === targetKey);
    const newPanes = items.filter((pane) => pane.key !== targetKey);
    if (newPanes.length && targetKey === activeKey) {
      const { key } =
        newPanes[
          targetIndex === newPanes.length ? targetIndex - 1 : targetIndex
        ];
      setActiveKey(key);
    }
    const newArrayBuffers = { ...arrayBuffers };
    delete newArrayBuffers[targetKey as string];
    setItems(newPanes);
    setArrayBuffers(newArrayBuffers);
  };

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
    } else {
      remove(targetKey);
    }
  };

  // GO 웹 어셈블리 모듈 로드
  useEffect(() => {
    const loadWebAssembly = async () => {
      const go = new Go();
      const wasmModule = await WebAssembly.instantiateStreaming(
        fetch('wasm/main.wasm'),
        go.importObject
      );
      go.run(wasmModule.instance);
    };

    loadWebAssembly();
  }, []);

  return (
    <IceMainLayout>
      <IceHeader>
        <LogoDiv>
          <LogoImage src={'pullLogo.png'} preview={false} />
        </LogoDiv>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <BigMenuBtn onClick={handleOpenClick} text="Open" />
        <BigMenuBtn onClick={() => {}} text="Save" />
        <BigMenuBtn onClick={() => {}} text="Help" />
        <BigMenuBtn onClick={() => {}} text="About" />
      </IceHeader>
      <IceLayout>
        <IceLeftSider width={300}>
          {activeKey && rows[activeKey] != null && (
            <MetaDataView exifRow={rows[activeKey]} />
          )}
        </IceLeftSider>
        <IceContent>
          <IceTabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey || undefined}
            type="editable-card"
            onEdit={onEdit}
            items={items}
          />
        </IceContent>
        <IceRightSider width={300}></IceRightSider>
      </IceLayout>
      <IceFooter></IceFooter>
    </IceMainLayout>
  );
};

export default MainLayout;
