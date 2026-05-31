'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  IceContent,
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
import { useConfig } from '@/contexts/ConfigContext/ConfigContext';
import Home from '@/components/Home/Home';
import { useTab } from '@/contexts/TabDataContext/TabDataContext';
import {
  encodingOptions,
  EncodingType,
} from '@/components/HexViewer/hexViewerConstants';
import Logo from '@/components/common/Icons/Logo/Logo';
import MessageModal from '@/components/MessageModal/MessageModal';
import MessageHistory from '@/components/MessageHistory/MessageHistory';
import Spinner from '@/components/common/Spinner/Spinner';
import Select from '@/components/common/Select/Select';
import OffsetNavigator from '@/components/OffsetNavigator/OffsetNavigator';
import SelectionDisplay from '@/components/SelectionDisplay/SelectionDisplay';
import InfoPanel from './SidePanels/InfoPanel';
import ToolsPanel from './SidePanels/ToolsPanel';
import { useProgress } from '@/hooks/useProgress';
import PrivacyBtn from '@/components/common/Btn/PrivacyBtn';

const MIN_SIDER_WIDTH = 100;

const MainLayout: React.FC = () => {
  const t = useTranslations();
  const { isEmpty } = useTab();
  const { config, updateConfig } = useConfig();
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

      <IceLayout as="main">
        {config.ui.panelVisibility.info.enabled && (
          <>
            <IceLeftSider
              style={{ width: `${leftSidePosition}px` }}
              $isCollapsed={leftSidePosition < MIN_SIDER_WIDTH}
              $isEmpty={isEmpty}
              $mobileActive={
                !config.ui.panelVisibility.tools.enabled || mobileTab === 'info'
              }
            >
              <InfoPanel />
            </IceLeftSider>
            <Separator
              {...leftSideSepProps}
              $isResizing={isLeftSideDragging}
              style={{ display: isEmpty ? 'none' : 'block' }}
            />
          </>
        )}

        <IceContent>{isEmpty ? <Home /> : <TabWindow />}</IceContent>

        {config.ui.panelVisibility.tools.enabled && (
          <>
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
              $mobileActive={
                !config.ui.panelVisibility.info.enabled || mobileTab === 'tools'
              }
            >
              <ToolsPanel />
            </IceRightSider>
          </>
        )}

        {!isEmpty &&
          config.ui.panelVisibility.info.enabled &&
          config.ui.panelVisibility.tools.enabled && (
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
          <SelectionDisplay />
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
              value={config.ui.encoding}
              options={encodingOptions}
              onChange={(value) =>
                updateConfig({
                  ui: { ...config.ui, encoding: value as EncodingType },
                })
              }
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
