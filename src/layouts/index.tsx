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
  IceMobileBottom,
  IceMobileContent,
  IceMobileLayout,
  IceRightSider,
  LogoDiv,
  LogoImage,
  SelectInfo,
  Separator,
} from './index.styles';
import { TabData, TabItem, TabKey } from '@/types';
import MenuBtnZone, { MenuBtnZoneRef } from '@/components/MenuBtnZone';
import TabWindow from '@/components/TabWindow';
import ExifRowViewer from '@/components/ExifRowViewer';
import Modal from '@/components/common/Modal';
import AboutMD from '@/components/markdown/AboutMD';
import HelpMD from '@/components/markdown/HelpMD';
import { useResizable } from 'react-resizable-layout';
import Searcher from '@/components/Searcher';
import { HexViewerRef } from '@/components/HexViewer';
import { useSelection } from '@/contexts/SelectionContext';
import Home from '@/components/Home';
import { isMobile } from 'react-device-detect';

const MainLayout: React.FC = () => {
  // Hex뷰어 Ref
  const hexViewerRef = useRef<HexViewerRef>(null);
  const menuBtnZoneRef = useRef<MenuBtnZoneRef>(null);
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

  const isEmptyItems = items.length <= 0;

  // 헥스 값 렌더링
  const showHex = (deciaml: number) => {
    return (
      <>
        <span style={{ color: 'var(--ice-main-color)' }}>{deciaml}</span>
        {'('}
        <span style={{ color: 'var(--ice-main-color_3)', fontWeight: '600' }}>
          {'0x'}
        </span>
        <span style={{ color: 'var(--ice-main-color)' }}>
          {deciaml.toString(16).toUpperCase()}
        </span>
        {`)`}
      </>
    );
  };

  // 메인 컨텐츠 뷰
  const showContent = () => {
    return isEmptyItems ? (
      <>
        <Home menuBtnZoneRef={menuBtnZoneRef} />
      </>
    ) : (
      <>
        <TabWindow
          items={items}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          setDatas={setDatas}
          setItems={setItems}
        />
      </>
    );
  };

  return (
    <IceMainLayout $isResizing={isResizing}>
      <IceHeader $isMobile={isMobile}>
        <LogoDiv>
          <LogoImage src={'pullLogo.png'} />
        </LogoDiv>

        <MenuBtnZone
          ref={menuBtnZoneRef}
          hexViewerRef={hexViewerRef}
          newTabIndex={newTabIndex}
          setDatas={setDatas}
          setItems={setItems}
          setActiveKey={setActiveKey}
          openModal={openModal}
        />
      </IceHeader>

      {isMobile ? (
        <>
          {/* 모바일 버전 */}
          <IceMobileLayout>
            <IceMobileContent>{showContent()}</IceMobileContent>
            {!isEmptyItems && (
              <IceMobileBottom>
                <div>
                  <ExifRowViewer activeKey={activeKey} datas={datas} />
                </div>
                <div>
                  <Searcher hexViewerRef={hexViewerRef} activeKey={activeKey} />
                </div>
              </IceMobileBottom>
            )}
          </IceMobileLayout>
        </>
      ) : (
        <>
          {/* PC 버전 */}
          <IceLayout>
            <IceLeftSider
              style={{
                width: `${leftSidePostion}px`,
                display:
                  leftSidePostion < minSiderWidth || isEmptyItems
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
                display: isEmptyItems ? 'none' : 'block',
              }}
            />

            <FlexGrow>
              <IceContent>{showContent()}</IceContent>
              <Separator
                {...rightSideSepProps}
                $reverse={true}
                $isResizing={isRightSideDragging}
                style={{
                  display: isEmptyItems ? 'none' : 'block',
                }}
              />
              <IceRightSider
                style={{
                  width: `${rightSidePostion}px`,
                  display:
                    rightSidePostion < minSiderWidth || isEmptyItems
                      ? 'none'
                      : 'block',
                }}
              >
                <Searcher hexViewerRef={hexViewerRef} activeKey={activeKey} />
              </IceRightSider>
            </FlexGrow>
          </IceLayout>
        </>
      )}

      <IceFooter $isMobile={isMobile}>
        <SelectInfo>
          {startIndex != null && endIndex != null && (
            <>
              {'선택됨:'}
              <div>
                {`오프셋: `}
                {showHex(startIndex)}
              </div>
              <div>
                {` 범위: `}
                {showHex(startIndex)}
                {`-`}
                {showHex(endIndex)}
              </div>
              <div>
                {` 길이: `}
                {showHex(endIndex - startIndex + 1)}
              </div>
            </>
          )}
        </SelectInfo>
        <IceCopyRight>{import.meta.env.VITE_APP_COPYRIGHT}</IceCopyRight>
      </IceFooter>

      <Modal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </IceMainLayout>
  );
};

export default MainLayout;
