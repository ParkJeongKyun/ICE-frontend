import { Button, FloatButton, Switch } from "antd";
import styled from "styled-components";

// 우고정
export const IceRBContainer = styled("div")`
  position: fixed;
  bottom: 5%;
  right: 5%;
`;

// 좌고정
export const IceLBContainer = styled("div")`
  position: fixed;
  bottom: 5%;
  left: 5%;
`;

// 우버튼
export const IceRButton = styled(FloatButton.Group)`
  & .ant-float-btn {
    background-color: var(--ice-main-bg-color);
  }
  & .ant-float-btn-body {
    background-color: var(--ice-main-bg-color);
    border: 0.5px solid var(--container-line-color);
  }
`;

// 좌 스위치
export const IceLSwicth = styled(Switch)`
  opacity: 0.5;
`;

// 중단 고정 저작권
export const IceCopy = styled("div")`
  position: fixed;
  color: var(--main-text-color);
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 10px;
  bottom: 2%;
  z-index: 9999;
  opacity: 0.5;
`;
