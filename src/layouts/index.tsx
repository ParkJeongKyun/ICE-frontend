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
  ProcessInfo,
  Spinner,
  SelectInfo,
  Separator,
  ProcessMsg,
  IceSelect,
  IceFooterRight,
} from './index.styles';
import MenuBtnZone, { MenuBtnZoneRef } from '@/components/MenuBtnZone';
import TabWindow from '@/components/TabWindow';
import ExifRowViewer from '@/components/ExifRowViewer';
import Modal from '@/components/common/Modal';
import AboutMD from '@/components/markdown/AboutMD';
import HelpMD from '@/components/markdown/HelpMD';
import { useResizable } from 'react-resizable-layout';
import Searcher from '@/components/Searcher';
import { HexViewerRef } from '@/components/HexViewer';
import { useProcess } from '@/contexts/ProcessContext';
import { useSelection } from '@/contexts/SelectionContext';
import Home from '@/components/Home';
import { isMobile } from 'react-device-detect';
import Yara from '@/components/Yara';
import {
  encodingOptions,
  useTabData,
  EncodingType,
} from '@/contexts/TabDataContext';
import Logo from '@/components/common/Icons/Logo';

const MainLayout: React.FC = () => {
  const { isEmpty, encoding, setEncoding } = useTabData();
  // Hex뷰어 Ref
  const hexViewerRef = useRef<HexViewerRef>(null);
  const menuBtnZoneRef = useRef<MenuBtnZoneRef>(null);
  // Modal 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentKey, setModalContentKey] = useState<string | null>(null);
  // 처리중인 파일 정보
  const { processInfo, isProcessing } = useProcess();
  const { fileName } = processInfo;

  // 선택된 셀 정보
  const { selectionRange } = useSelection();
  const { start: startIndex, end: endIndex } = selectionRange;

  const selectionInfo = useMemo(() => {
    if (startIndex === null || endIndex === null) return null;

    const minOffset = Math.min(startIndex, endIndex);
    const maxOffset = Math.max(startIndex, endIndex);
    const length = maxOffset - minOffset + 1;

    return { minOffset, maxOffset, length };
  }, [startIndex, endIndex]);

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
        fetch('/wasm/ice_app.wasm'),
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
    return isEmpty ? (
      <>
        <Home menuBtnZoneRef={menuBtnZoneRef} />
      </>
    ) : (
      <>
        <TabWindow />
      </>
    );
  };

  return (
    <IceMainLayout $isResizing={isResizing}>
      <IceHeader $isMobile={isMobile} $isProcessing={isProcessing}>
        <Logo showText />
        <MenuBtnZone
          ref={menuBtnZoneRef}
          hexViewerRef={hexViewerRef}
          openModal={openModal}
        />
      </IceHeader>

      {isMobile ? (
        <>
          {/* 모바일 버전 */}
          <IceMobileLayout>
            <IceMobileContent>{showContent()}</IceMobileContent>
            {!isEmpty && (
              <IceMobileBottom>
                <div>
                  <ExifRowViewer />
                </div>
                <div>
                  <Searcher hexViewerRef={hexViewerRef} />
                  {/* <Yara /> */}
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
                  leftSidePostion < minSiderWidth || isEmpty ? 'none' : 'block',
              }}
            >
              <ExifRowViewer />
            </IceLeftSider>
            <Separator
              {...leftSideSepProps}
              $isResizing={isLeftSideDragging}
              style={{
                display: isEmpty ? 'none' : 'block',
              }}
            />

            <FlexGrow>
              <IceContent>{showContent()}</IceContent>
              <Separator
                {...rightSideSepProps}
                $reverse={true}
                $isResizing={isRightSideDragging}
                style={{
                  display: isEmpty ? 'none' : 'block',
                }}
              />
              <IceRightSider
                style={{
                  width: `${rightSidePostion}px`,
                  display:
                    rightSidePostion < minSiderWidth || isEmpty
                      ? 'none'
                      : 'block',
                }}
              >
                <Searcher hexViewerRef={hexViewerRef} />
                {/* <Yara /> */}
              </IceRightSider>
            </FlexGrow>
          </IceLayout>
        </>
      )}

      <IceFooter $isMobile={isMobile}>
        {isProcessing && (
          <ProcessInfo>
            <Spinner />
            <ProcessMsg>{fileName} 분석중</ProcessMsg>
          </ProcessInfo>
        )}
        <SelectInfo>
          {selectionInfo && (
            <>
              {'선택됨:'}
              <div>
                {`오프셋: `}
                {showHex(selectionInfo.minOffset)}
              </div>
              <div>
                {` 범위: `}
                {showHex(selectionInfo.minOffset)}
                {`-`}
                {showHex(selectionInfo.maxOffset)}
              </div>
              <div>
                {` 길이: `}
                {showHex(selectionInfo.length)}
              </div>
            </>
          )}
        </SelectInfo>
        <IceFooterRight>
          {!isEmpty && (
            <div>
              인코딩:
              <IceSelect
                value={encoding}
                onChange={(e) => setEncoding(e.target.value as EncodingType)}
              >
                {encodingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </IceSelect>
            </div>
          )}
          <IceCopyRight>{import.meta.env.VITE_APP_COPYRIGHT}</IceCopyRight>
        </IceFooterRight>
      </IceFooter>

      <Modal title={modalTitle} isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </IceMainLayout>
  );
};

export default MainLayout;
