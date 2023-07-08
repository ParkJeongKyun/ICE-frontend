import { Drawer } from "antd";
import styled from "styled-components";

// 드로워
export const IceDrawer = styled(Drawer)`
  background-color: var(--container-bg-color) !important;
  border: var(--main-border-size) solid var(--container-line-color);
  color: var(--container-line-color);

  & .ant-drawer-header {
    border-bottom: var(--main-border-size) solid var(--container-line-color);
  }

  & .ant-drawer-title {
    color: var(--container-line-color);
  }

  & .ant-drawer-close svg {
    fill: var(--container-line-color);
  }
`;
