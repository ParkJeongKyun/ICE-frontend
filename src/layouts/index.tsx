import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlexGrow,
  IceContent,
  IceCopyRight,
  IceFooter,
  IceHeader,
  IceLayout,
  IceLeftSider,
  IceMainLayout,
  IceRightSider,
  LogoDiv,
  LogoImage,
  SelectInfo,
  Separator,
} from './index.styles';
import { TabData, TabItem, TabKey } from 'types';
import MenuBtnZone from '../components/MenuBtnZone';
import TabWindow from '../components/TabWindow';
import ExifRowViewer from '../components/ExifRowViewer';
import Modal from 'components/common/Modal';
import AboutMD from 'components/markdown/AboutMD';
import HelpMD from 'components/markdown/HelpMD';
import { useResizable } from 'react-resizable-layout';
import Searcher from 'components/Searcher';
import { HexViewerRef } from 'components/HexViewer';
import { useSelection } from 'contexts/SelectionContext';

const MainLayout: React.FC = () => {
  // Hex뷰어 Ref
  const hexViewerRef = useRef<HexViewerRef>(null);
  // Tab 데이터
  const newTabIndex = useRef(0);
  const [activeKey, setActiveKey] = useState<TabKey>(0);
  const [datas, setDatas] = useState<TabData>(new Map());
  const [items, setItems] = useState<TabItem[]>([]);
  // Modal 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentKey, setModalContentKey] = useState<string | null>(null);
  // 선택된 셀 정보
  const { selectionRange, setSelectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;

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

  const minSiderWidth = 100;
  const {
    isDragging: isLeftSideDragging,
    position: leftSidePostion,
    separatorProps: leftSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: minSiderWidth * 3.5,
    max: minSiderWidth * 5,
  });
  const {
    isDragging: isRightSideDragging,
    position: rightSidePostion,
    separatorProps: rightSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: minSiderWidth * 2.5,
    reverse: true,
    max: minSiderWidth * 3,
  });

  const isResizing = isLeftSideDragging || isRightSideDragging;

  const showHex = (deciaml: number) => {
    return (
      <>
        <span style={{ color: 'var(--ice-main-color)' }}>{deciaml}</span>
        {'('}
        <span style={{ color: 'var(--ice-main-color)', fontWeight: '600' }}>
          {'0x'}
        </span>
        {deciaml.toString(16).toUpperCase()}
        {`)`}
      </>
    );
  };

  return (
    <IceMainLayout $isResizing={isResizing}>
      <IceHeader>
        <LogoDiv>
          <LogoImage src={'pullLogo.png'} />
        </LogoDiv>

        <MenuBtnZone
          hexViewerRef={hexViewerRef}
          newTabIndex={newTabIndex}
          setDatas={setDatas}
          setItems={setItems}
          setActiveKey={setActiveKey}
          openModal={openModal}
        />
      </IceHeader>

      <IceLayout>
        <IceLeftSider
          style={{
            width: `${leftSidePostion}px`,
            display:
              leftSidePostion < minSiderWidth || items.length <= 0
                ? 'none'
                : 'block',
          }}
        >
          <ExifRowViewer activeKey={activeKey} datas={datas} />
        </IceLeftSider>
        <Separator
          {...leftSideSepProps}
          $isResizing={isLeftSideDragging}
          style={{
            display: items.length <= 0 ? 'none' : 'block',
          }}
        />

        <FlexGrow>
          <IceContent>
            <TabWindow
              items={items}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              setDatas={setDatas}
              setItems={setItems}
            />
          </IceContent>
          <Separator
            {...rightSideSepProps}
            $reverse={true}
            $isResizing={isRightSideDragging}
            style={{
              display: items.length <= 0 ? 'none' : 'block',
            }}
          />
          <IceRightSider
            style={{
              width: `${rightSidePostion}px`,
              display:
                rightSidePostion < minSiderWidth || items.length <= 0
                  ? 'none'
                  : 'block',
            }}
          >
            <Searcher hexViewerRef={hexViewerRef} activeKey={activeKey} />
          </IceRightSider>
        </FlexGrow>
      </IceLayout>

      <IceFooter>
        <SelectInfo>
          {startIndex != null && endIndex != null && (
            <>
              {`선택됨: 오프셋: `}
              {showHex(startIndex)}
              {` 범위: `}
              {showHex(startIndex)}
              {`-`}
              {showHex(endIndex)}
              {` 길이: `}
              {showHex(endIndex - startIndex + 1)}
            </>
          )}
        </SelectInfo>
        <IceCopyRight>
          © 2024 Park Jeong-kyun (dbzoseh84@gmail.com). All rights reserved.
        </IceCopyRight>
      </IceFooter>

      <Modal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </IceMainLayout>
  );
};

export default MainLayout;
