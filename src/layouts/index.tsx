'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  IceMobileContent,
  IceMobileLayout,
  IceRightSider,
  ProcessInfo,
  SelectInfo,
  SelectLabel,
  SelectValue,
  Separator,
  IceFooterRight,
  IceHeaderLeftSider,
  IceMobileTabBar,
  IceMobileTabButton,
  IceMobileTabPanel,
} from './index.styles';
import MenuBtnZone from '@/components/MenuBtnZone';
import TabWindow from '@/components/TabWindow';
import Modal from '@/components/common/Modal';

import { useResizable } from 'react-resizable-layout';
import { useProcess } from '@/contexts/ProcessContext';
import Home from '@/components/Home';
import {
  encodingOptions,
  useTab,
  useSelection,
  EncodingType,
} from '@/contexts/TabDataContext';
import Logo from '@/components/common/Icons/Logo';
import MessageModal from '@/components/MessageModal';
import MessageHistory from '@/components/MessageHistory';
import Spinner from '@/components/common/Spinner';
import Select from '@/components/common/Select';
import OffsetNavigator from '@/components/OffsetNavigator';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import InfoPanel from './SidePanels/InfoPanel';
import ToolsPanel from './SidePanels/ToolsPanel';
import { useIsMobile } from './useIsMobile';

const MIN_SIDER_WIDTH = 100;

const MainLayout: React.FC = () => {
  const t = useTranslations();
  const { isEmpty, encoding, setEncoding } = useTab();
  const { activeSelectionState } = useSelection();
  const { isProcessing, progress } = useProcess();
  const [mobileTab, setMobileTab] = useState<'info' | 'tools'>('info');
  const isMobileView = useIsMobile();

  const {
    isDragging: isLeftSideDragging,
    position: leftSidePosition,
    separatorProps: leftSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: MIN_SIDER_WIDTH * 4,
    max: MIN_SIDER_WIDTH * 5.5,
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
    if (
      !activeSelectionState ||
      activeSelectionState.start === null ||
      activeSelectionState.start < 0 ||
      activeSelectionState.end === null ||
      activeSelectionState.end < 0
    )
      return null;

    const minOffset = Math.min(
      activeSelectionState.start,
      activeSelectionState.end
    );
    const maxOffset = Math.max(
      activeSelectionState.start,
      activeSelectionState.end
    );

    return {
      minOffset,
      maxOffset,
      length: maxOffset - minOffset + 1,
    };
  })();

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
      <IceHeader $isMobile={isMobileView} $isProcessing={isProcessing}>
        <IceHeaderLeftSider $isMobile={isMobileView}>
          <Logo showText />
          <MenuBtnZone />
          {!isMobileView && <LanguageSwitcher />}
        </IceHeaderLeftSider>
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

      {isMobileView ? (
        <IceMobileLayout>
          <IceMobileContent>
            {isEmpty ? <Home /> : <TabWindow />}
          </IceMobileContent>
          {!isEmpty && (
            <>
              <IceMobileTabBar>
                <IceMobileTabButton
                  $active={mobileTab === 'info'}
                  onClick={() => setMobileTab('info')}
                >
                  {t('mobile.tabs.info')}
                </IceMobileTabButton>
                <IceMobileTabButton
                  $active={mobileTab === 'tools'}
                  onClick={() => setMobileTab('tools')}
                >
                  {t('mobile.tabs.tools')}
                </IceMobileTabButton>
              </IceMobileTabBar>

              {/* 항상 마운트되게 변경: 검색(OffsetNavigator) 동작을 위해 Searcher의 ref가 필요합니다 */}
              <IceMobileTabPanel $active={mobileTab === 'info'}>
                <InfoPanel />
              </IceMobileTabPanel>

              <IceMobileTabPanel $active={mobileTab === 'tools'}>
                <ToolsPanel />
              </IceMobileTabPanel>
            </>
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
            <InfoPanel />
          </IceLeftSider>
          <Separator
            {...leftSideSepProps}
            $isResizing={isLeftSideDragging}
            style={{ display: isEmpty ? 'none' : 'block' }}
          />

          <FlexGrow>
            <IceContent>{isEmpty ? <Home /> : <TabWindow />}</IceContent>
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
              <ToolsPanel />
            </IceRightSider>
          </FlexGrow>
        </IceLayout>
      )}

      <IceFooter $isMobile={isMobileView}>
        <SelectInfo>
          {selectionInfo ? (
            isMobileView ? (
              <div>
                <SelectLabel>{t('footer.offset')}:</SelectLabel>
                {showHex(selectionInfo.minOffset)}
              </div>
            ) : (
              <>
                <div>
                  <SelectLabel>{t('footer.selection')}:</SelectLabel>
                  {showHex(selectionInfo.length)}
                </div>
                <div>
                  <SelectLabel>{t('footer.offset')}:</SelectLabel>
                  {showHex(selectionInfo.minOffset)}
                </div>
                <div>
                  <SelectLabel>{t('footer.range')}:</SelectLabel>
                  {showHex(selectionInfo.minOffset)}-
                  {showHex(selectionInfo.maxOffset)}
                </div>
              </>
            )
          ) : (
            <IceCopyRight>{process.env.NEXT_PUBLIC_APP_COPYRIGHT}</IceCopyRight>
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
              tooltip={t('footer.encoding')}
            />
          )}
          {isMobileView && <LanguageSwitcher />}
          <MessageHistory />
        </IceFooterRight>
      </IceFooter>
      <Modal />
      <MessageModal />
    </IceMainLayout>
  );
};

export default React.memo(MainLayout);
