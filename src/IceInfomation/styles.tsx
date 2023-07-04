import { Drawer } from "antd";
import styled from "styled-components";

export const IceDrawer = styled(Drawer)`
  background-color: var(--container-bg-color) !important;
  border: 0.5px solid var(--ice-line-color);
  color: var(--ice-line-color);

  & .ant-drawer-header {
    // background-color: var(--container-bg-color) !important;
    border-bottom: 0.5px solid var(--ice-line-color);
  }

  & .ant-drawer-title {
    color: var(--ice-line-color);
  }

  & .ant-drawer-close svg {
    fill: var(--ice-line-color);
  }
`;
