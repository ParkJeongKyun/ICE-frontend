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
import { useEffect, useRef, useState } from 'react';
import { ExifRow } from 'types';
import MenuBtnZone from './MenuBtnZone';
import TabWindow from './TabWindow';

export type TabKey = number;

export interface TabItem {
  label: string;
  children: React.ReactNode;
  key: TabKey;
}

export type TabData = Map<number, { rows: ExifRow[]; buffer: ArrayBuffer }>;

const MainLayout: React.FC = () => {
  const newTabIndex = useRef(0);
  const [activeKey, setActiveKey] = useState<TabKey>(0);
  const [datas, setDatas] = useState<TabData>(new Map());
  const [items, setItems] = useState<TabItem[]>([]);

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
          <LogoImage src={'pullLogo.png'} />
        </LogoDiv>

        <MenuBtnZone
          newTabIndex={newTabIndex}
          setDatas={setDatas}
          setItems={setItems}
          setActiveKey={setActiveKey}
        />
      </IceHeader>

      <IceLayout>
        <IceLeftSider />
        <IceContent>
          <TabWindow
            items={items}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
          />
        </IceContent>
        <IceRightSider />
      </IceLayout>

      <IceFooter></IceFooter>
    </IceMainLayout>
  );
};

export default MainLayout;
