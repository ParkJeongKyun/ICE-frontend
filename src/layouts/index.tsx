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
import { ChangeEvent, useRef, useState } from 'react';
import HexViewer from 'components/common/HexViewer';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface ArrayBufferMap {
  [key: string]: ArrayBuffer | null;
}

const MainLayout: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      reader.onload = (event) => {
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
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const add = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    setItems([
      ...items,
      { label: 'New Tab', children: 'New Tab Pane', key: newActiveKey },
    ]);
    setActiveKey(newActiveKey);
    setArrayBuffers({ ...arrayBuffers, [newActiveKey]: null });
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
      add();
    } else {
      remove(targetKey);
    }
  };

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
        <IceLeftSider width={300}></IceLeftSider>
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
