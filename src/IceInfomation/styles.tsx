import { Drawer, Tabs } from "antd";
import styled from "styled-components";

// 드로워
export const IceDrawer = styled(Drawer)`
  background-color: var(--container-bg-color) !important;
  border: var(--main-border-size) solid var(--container-line-color);
  color: var(--container-line-color);

  & .ant-drawer-header {
    border-bottom: var(--main-border-size) solid var(--container-line-color);
  }

  & .ant-drawer-body {
    padding: 0px;
  }

  & .ant-drawer-title {
    color: var(--container-line-color);
  }

  & .ant-drawer-close svg {
    fill: var(--container-line-color);
  }
`;

export const IceTabs = styled(Tabs)`
  & .ant-tabs-tab {
    background-color: transparent !important;
    border-radius: 0px !important;
    padding: 10px !important;
    margin: 0px !important;
    border: none !important;
  }
  & .ant-tabs-tab-active {
    background-color: transparent !important;
  }
  & .ant-tabs-tab-btn {
    border-radius: 0px !important;
  }
`;
