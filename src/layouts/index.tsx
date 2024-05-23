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
import { ExifRow, TabData, TabItem, TabKey, fileinfo } from 'types';
import MenuBtnZone from '../components/MenuBtnZone';
import TabWindow from '../components/TabWindow';
import ExifRowViewer from '../components/ExifRowViewer';

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

  console.log('============================');
  console.log('item', items);
  console.log('datas', datas);
  console.log('newTabIndex.current', newTabIndex.current);
  console.log('activeKey', activeKey);

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
        <IceLeftSider>
          <ExifRowViewer activeKey={activeKey} datas={datas} />
        </IceLeftSider>
        <IceContent>
          <TabWindow
            items={items}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            setDatas={setDatas}
            setItems={setItems}
          />
        </IceContent>
        <IceRightSider />
      </IceLayout>

      <IceFooter>
        © 2024 Park Jeong-kyun (dbzoseh84@gmail.com). All rights reserved.
      </IceFooter>
    </IceMainLayout>
  );
};

export default MainLayout;
