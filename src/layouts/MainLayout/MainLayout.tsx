'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  IceContent,
  IceCopyRight,
  IceFooter,
  IceHeader,
  IceHeaderProgressBar,
  IceLayout,
  IceLeftSider,
  IceMainLayout,
  VisuallyHiddenH1,
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
} from './MainLayout.styles';
import MenuBtnZone from '@/components/MenuBtnZone/MenuBtnZone';
import TabWindow from '@/components/TabWindow/TabWindow';

import { useResizable } from 'react-resizable-layout';
import { useProcess } from '@/contexts/ProcessContext/ProcessContext';
import Home from '@/components/Home/Home';
import {
  encodingOptions,
  useTab,
  useSelection,
  EncodingType,
} from '@/contexts/TabDataContext/TabDataContext';
import Logo from '@/components/common/Icons/Logo/Logo';
import MessageModal from '@/components/MessageModal/MessageModal';
import MessageHistory from '@/components/MessageHistory/MessageHistory';
import Spinner from '@/components/common/Spinner/Spinner';
import Select from '@/components/common/Select/Select';
import OffsetNavigator from '@/components/OffsetNavigator/OffsetNavigator';
import InfoPanel from './SidePanels/InfoPanel';
import ToolsPanel from './SidePanels/ToolsPanel';
import { useProgress } from '@/hooks/useProgress';
import PrivacyBtn from '@/components/common/Btn/PrivacyBtn';

const MIN_SIDER_WIDTH = 100;

const MainLayout: React.FC = () => {
  const t = useTranslations();
  const { isEmpty, encoding, setEncoding } = useTab();
  const { activeSelectionState } = useSelection();
  const { isProcessing } = useProcess();
  const { progress } = useProgress();
  const [mobileTab, setMobileTab] = useState<'info' | 'tools'>('info');

  const {
    isDragging: isLeftSideDragging,
    position: leftSidePosition,
    separatorProps: leftSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: MIN_SIDER_WIDTH * 5,
    max: MIN_SIDER_WIDTH * 8,
  });

  const {
    isDragging: isRightSideDragging,
    position: rightSidePosition,
    separatorProps: rightSideSepProps,
  } = useResizable({
    axis: 'x',
    initial: MIN_SIDER_WIDTH * 5,
    reverse: true,
    max: MIN_SIDER_WIDTH * 8,
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
      <VisuallyHiddenH1>{t('home.h1Title')}</VisuallyHiddenH1>
      <IceHeader $isProcessing={isProcessing}>
        <IceHeaderLeftSider>
          <Logo showText />
          <MenuBtnZone />
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

      <IceLayout role="main">
        <IceLeftSider
          style={{ width: `${leftSidePosition}px` }}
          $isCollapsed={leftSidePosition < MIN_SIDER_WIDTH}
          $isEmpty={isEmpty}
          $mobileActive={mobileTab === 'info'}
        >
          <InfoPanel />
        </IceLeftSider>
        <Separator
          {...leftSideSepProps}
          $isResizing={isLeftSideDragging}
          style={{ display: isEmpty ? 'none' : 'block' }}
        />

        <IceContent>{isEmpty ? <Home /> : <TabWindow />}</IceContent>

        <Separator
          {...rightSideSepProps}
          $reverse={true}
          $isResizing={isRightSideDragging}
          style={{ display: isEmpty ? 'none' : 'block' }}
        />
        <IceRightSider
          style={{ width: `${rightSidePosition}px` }}
          $isCollapsed={rightSidePosition < MIN_SIDER_WIDTH}
          $isEmpty={isEmpty}
          $mobileActive={mobileTab === 'tools'}
        >
          <ToolsPanel />
        </IceRightSider>

        {!isEmpty && (
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
        )}
      </IceLayout>

      <IceFooter>
        <SelectInfo>
          {selectionInfo ? (
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
          ) : (
            <IceCopyRight>{t('copyright')}</IceCopyRight>
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
          <PrivacyBtn />
          <MessageHistory />
        </IceFooterRight>
      </IceFooter>
      <MessageModal />
    </IceMainLayout>
  );
};

export default React.memo(MainLayout);
