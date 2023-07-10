import { Drawer, Tabs } from "antd";
import styled from "styled-components";

// 드로워
export const IceDrawer = styled(Drawer)`
  min-width: var(--container-width-size);
  max-width: var(--container-width-size);

  background-color: var(--container-bg-color) !important;
  border: var(--main-border-size) solid var(--container-line-color);
  color: var(--container-text-color);

  & .ant-drawer-header {
    border-bottom: var(--main-border-size) solid var(--container-line-color);
  }

  & .ant-drawer-body {
    padding: 0px;
  }

  & .ant-drawer-title {
    color: var(--container-text-color);
  }

  & .ant-drawer-close svg {
    fill: var(--container-line-color);
  }
`;

export const IceTabs = styled(Tabs)`
  & .ant-tabs-tab {
    padding: 10px !important;
    margin: 0px !important;
    border-radius: 0px !important;

    background-color: transparent !important;
    border: none !important;
    color: var(--container-text-color);
  }
  & .ant-tabs-tab-active {
    // background-color: transparent !important;
    background-color: var(--container-bg-color) !important;
  }
  & .ant-tabs-tab-btn {
    border-radius: 0px !important;
  }
  & .ant-tabs-content {
    padding: var(--main-padding-size);
    color: var(--container-text-color);
  }
`;
