import { Modal } from "antd";
import styled from "styled-components";

// 모달
export const IceModalS = styled(Modal)`
  max-width: var(--container-width-size);
  & .ant-modal-content {
    padding: 0px;

    border-radius: var(--container-radius-size);

    background-color: var(--ice-main-bg-color) !important;
    border: var(--main-border-size) solid var(--container-line-color);
    color: var(--container-line-color);
  }

  & .ant-modal-header {
    background-color: transparent;
  }

  & .ant-modal-title {
    padding: var(--modal-padding-size);
    color: var(--container-line-color);
    border-bottom: var(--main-border-size) solid var(--container-line-color);
  }

  & .ant-modal-body {
    padding: var(--modal-padding-size);
  }

  & .ant-modal-footer {
    display: none;
    button {
      background-color: var(--ice-main-bg-color) !important;
      border: var(--main-border-size) solid var(--container-line-color);
      color: var(--container-line-color);
    }
  }

  & .ant-modal-close-icon svg {
    fill: var(--container-line-color);
  }
`;
