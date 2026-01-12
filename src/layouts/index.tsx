import React, { useMemo, useState } from 'react';
import {
  FlexGrow,
  IceContent,
  IceCopyRight,
  IceFooter,
  IceHeader,
  IceHeaderProgressBar,
  IceLayout,
  IceLeftSider,
  IceMainLayout,
  IceMobileBottom,
  IceMobileContent,
  IceMobileLayout,
  IceRightSider,
  ProcessInfo,
  SelectInfo,
  SelectLabel,
  SelectValue,
  Separator,
  IceFooterRight,
} from './index.styles';
import MenuBtnZone from '@/components/MenuBtnZone';
import TabWindow from '@/components/TabWindow';
import ExifRowViewer from '@/components/ExifRowViewer';
import Modal from '@/components/common/Modal';
import AboutMD from '@/components/markdown/AboutMD';
import HelpMD from '@/components/markdown/HelpMD';
import { useResizable } from 'react-resizable-layout';
import Searcher from '@/components/Searcher';
import { useProcess } from '@/contexts/ProcessContext';
import Home from '@/components/Home';
import { isMobile } from 'react-device-detect';
import {
  encodingOptions,
  useTabData,
  EncodingType,
} from '@/contexts/TabDataContext';
import { useRefs } from '@/contexts/RefContext';
import Logo from '@/components/common/Icons/Logo';
import DataInspector from '@/components/DataInspector';
import MessageModal from '@/components/MessageModal';
import MessageHistory from '@/components/MessageHistory';
import Spinner from '@/components/common/Spinner';
import Select from '@/components/common/Select';
import OffsetNavigator from '@/components/OffsetNavigator';

const MIN_SIDER_WIDTH = 100;

const MainLayout: React.FC = () => {
  const { isEmpty, encoding, setEncoding, activeSelectionState } =
    useTabData();
  const { isProcessing, progress } = useProcess();
  const { menuBtnZoneRef, searcherRef } = useRefs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentKey, setModalContentKey] = useState<string | null>(null);

  const {
    isDragging: isLeftSideDragging,
    position: leftSidePosition,
    separatorProps: leftSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: MIN_SIDER_WIDTH * 3.5,
    max: MIN_SIDER_WIDTH * 5,
  });

  const {
    isDragging: isRightSideDragging,
    position: rightSidePosition,
    separatorProps: rightSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: MIN_SIDER_WIDTH * 3,
    reverse: true,
    max: MIN_SIDER_WIDTH * 4.5,
  });

  const selectionInfo = (() => {
    if (!activeSelectionState || activeSelectionState.start === null || activeSelectionState.start < 0 || activeSelectionState.end === null || activeSelectionState.end < 0) return null;

    const minOffset = Math.min(activeSelectionState.start, activeSelectionState.end);
    const maxOffset = Math.max(activeSelectionState.start, activeSelectionState.end);

    return {
      minOffset,
      maxOffset,
      length: maxOffset - minOffset + 1,
    };
  })();

  const [modalTitle, modalContent] = useMemo(() => {
    const modalData = {
      about: ['사이트 정보', <AboutMD key="about" />],
      help: ['도움말', <HelpMD key="help" />],
    };
    const data = modalContentKey
      ? modalData[modalContentKey as keyof typeof modalData]
      : null;
    return data ? [<b key="title">{data[0]}</b>, data[1]] : [null, null];
  }, [modalContentKey]);

  const showHex = (decimal: number) => (
    <SelectValue>
      {decimal}
      <SelectValue as="span">
        (0x{decimal.toString(16).toUpperCase()})
      </SelectValue>
    </SelectValue>
  );

  return (
    <IceMainLayout $isResizing={isLeftSideDragging || isRightSideDragging}>
      <IceHeader $isMobile={isMobile}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo showText />
          <MenuBtnZone
            ref={menuBtnZoneRef}
            openModal={(key) => {
              setModalContentKey(key);
              setIsModalOpen(true);
            }}
          />
        </div>
        <OffsetNavigator />
        {isProcessing && (
          <>
            <IceHeaderProgressBar
              $progress={progress}
              $isProcessing={isProcessing}
            >
              <div />
            </IceHeaderProgressBar>
          </>
        )}
      </IceHeader>

      {isMobile ? (
        <IceMobileLayout>
          <IceMobileContent>
            {isEmpty ? <Home /> : <TabWindow />}
          </IceMobileContent>
          {!isEmpty && (
            <IceMobileBottom>
              <div>
                <ExifRowViewer />
              </div>
              <div>
                <Searcher ref={searcherRef} />
              </div>
              <div>
                <DataInspector />
              </div>
            </IceMobileBottom>
          )}
        </IceMobileLayout>
      ) : (
        <IceLayout>
          <IceLeftSider
            style={{
              width: `${leftSidePosition}px`,
              display:
                leftSidePosition < MIN_SIDER_WIDTH || isEmpty
                  ? 'none'
                  : 'block',
            }}
          >
            <ExifRowViewer />
          </IceLeftSider>
          <Separator
            {...leftSideSepProps}
            $isResizing={isLeftSideDragging}
            style={{ display: isEmpty ? 'none' : 'block' }}
          />

          <FlexGrow>
            <IceContent>
              {isEmpty ? (
                <Home />
              ) : (
                <TabWindow />
              )}
            </IceContent>
            <Separator
              {...rightSideSepProps}
              $reverse={true}
              $isResizing={isRightSideDragging}
              style={{ display: isEmpty ? 'none' : 'block' }}
            />
            <IceRightSider
              style={{
                width: `${rightSidePosition}px`,
                display:
                  rightSidePosition < MIN_SIDER_WIDTH || isEmpty
                    ? 'none'
                    : 'block',
              }}
            >
              <Searcher ref={searcherRef} />
              <DataInspector />
            </IceRightSider>
          </FlexGrow>
        </IceLayout>
      )}

      <IceFooter $isMobile={isMobile}>
        <SelectInfo>
          {selectionInfo ? (
            isMobile ? (
              <div>
                <SelectLabel>오프셋:</SelectLabel>
                {showHex(selectionInfo.minOffset)}
              </div>
            ) : (
              <>
                <div>
                  <SelectLabel>선택:</SelectLabel>
                  {showHex(selectionInfo.length)}
                </div>
                <div>
                  <SelectLabel>오프셋:</SelectLabel>
                  {showHex(selectionInfo.minOffset)}
                </div>
                <div>
                  <SelectLabel>범위:</SelectLabel>
                  {showHex(selectionInfo.minOffset)}-
                  {showHex(selectionInfo.maxOffset)}
                </div>
              </>
            )
          ) : (
            <IceCopyRight>{import.meta.env.VITE_APP_COPYRIGHT}</IceCopyRight>
          )}
        </SelectInfo>
        <IceFooterRight>
          {isProcessing && (
            <>
              <ProcessInfo>
                <Spinner size={16} />
              </ProcessInfo>
            </>
          )}
          {!isEmpty && (
            <Select
              value={encoding}
              options={encodingOptions}
              onChange={(value) => setEncoding(value as EncodingType)}
              tooltip="인코딩"
            />
          )}
          <MessageHistory />
        </IceFooterRight>
      </IceFooter>

      <Modal
        title={modalTitle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalContentKey(null);
        }}
      >
        {modalContent}
      </Modal>
      <MessageModal />
    </IceMainLayout>
  );
};

export default React.memo(MainLayout);
