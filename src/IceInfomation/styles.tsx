import { Drawer } from "antd";
import styled from "styled-components";

export const IceDrawer = styled(Drawer)`
  background-color: var(--container-bg-color) !important;
  border: 0.5px solid var(--container-line-color);
  color: var(--container-line-color);

  & .ant-drawer-header {
    // background-color: var(--container-bg-color) !important;
    border-bottom: 0.5px solid var(--container-line-color);
  }

  & .ant-drawer-title {
    color: var(--container-line-color);
  }

  & .ant-drawer-close svg {
    fill: var(--container-line-color);
  }
`;
