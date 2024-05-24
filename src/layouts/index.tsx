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
import { useEffect, useMemo, useRef, useState } from 'react';
import { TabData, TabItem, TabKey } from 'types';
import MenuBtnZone from '../components/MenuBtnZone';
import TabWindow from '../components/TabWindow';
import ExifRowViewer from '../components/ExifRowViewer';
import Modal from 'components/common/Modal';
import AboutMD from 'components/markdown/AboutMD';
import HelpMD from 'components/markdown/HelpMD';

const MainLayout: React.FC = () => {
  // Tab 데이터
  const newTabIndex = useRef(0);
  const [activeKey, setActiveKey] = useState<TabKey>(0);
  const [datas, setDatas] = useState<TabData>(new Map());
  const [items, setItems] = useState<TabItem[]>([]);
  // Modal 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentKey, setModalContentKey] = useState<string | null>(null);

  // 모달 Open 이벤트
  const openModal = (key: string) => {
    setModalContentKey(key);
    setIsModalOpen(true);
  };

  // 모달 Close 이벤트
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContentKey(null);
  };

  // 모달 데이터
  const [modalTitle, modalContent] = useMemo(() => {
    switch (modalContentKey) {
      case 'about':
        return [
          <>
            <b>사이트 정보</b>
          </>,
          <>
            <AboutMD />
          </>,
        ];
      case 'help':
        return [
          <>
            <b>도움말</b>
          </>,
          <>
            <HelpMD />
          </>,
        ];
      default:
        return [null, null];
    }
  }, [modalContentKey]);

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

  // 테스트용 콘솔 출력
  // console.log('============================');
  // console.log('item', items);
  // console.log('datas', datas);
  // console.log('newTabIndex.current', newTabIndex.current);
  // console.log('activeKey', activeKey);

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
          openModal={openModal}
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

      <Modal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </IceMainLayout>
  );
};

export default MainLayout;
