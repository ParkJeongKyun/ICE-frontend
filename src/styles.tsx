import { Button, FloatButton, Switch } from "antd";
import styled from "styled-components";

// 우버튼
export const IceRButton = styled(FloatButton.Group)`
  bottom: 5%;
  right: 5%;

  & .ant-float-btn {
    background-color: var(--ice-main-bg-color);
  }
  & .ant-float-btn-body {
    background-color: var(--ice-main-bg-color);
    border: var(--main-border-size) solid var(--container-line-color);
  }
`;

// 중단 고정 저작권
export const IceCopy = styled("div")`
  position: fixed;
  color: var(--main-text-color);
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: var(--main-copy-font-size);
  bottom: 2%;
  z-index: 9999;
  opacity: 0.5;
`;
