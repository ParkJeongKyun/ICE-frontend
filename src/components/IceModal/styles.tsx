import { Drawer, Modal } from "antd";
import styled from "styled-components";

// 모달
export const IceModalS = styled(Modal)`
  & .ant-modal-content {
    background-color: var(--container-bg-color) !important;
    border: var(--main-border-size) solid var(--container-line-color);
    color: var(--container-line-color);
    border-radius: var(--container-radius-size);
  }

  & .ant-modal-header {
    background-color: transparent;
  }

  & .ant-modal-title {
    color: var(--container-line-color);
    padding-bottom: var(--main-big-padding-size);
    border-bottom: var(--main-border-size) solid var(--container-line-color);
  }

  & .ant-modal-footer {
    display: none;
    button {
      background-color: var(--container-bg-color) !important;
      border: var(--main-border-size) solid var(--container-line-color);
      color: var(--container-line-color);
    }
  }

  & .ant-modal-close-icon svg {
    fill: var(--container-line-color);
  }
`;
