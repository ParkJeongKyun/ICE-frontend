import { Button } from "antd";
import styled from "styled-components";

export const IceRBContainer = styled("div")`
  position: fixed;
  // bottom: 15px;
  // right: 15px;
  bottom: 5%;
  right: 5%;
`;

export const IceRButton = styled(Button)`
  padding: 0px;
  margin: 0px;
  width: 30px;
  height: 30px;
  // background-color: transparent;
  background-color: black;
  border: 2px solid var(--container-line-color);
  // border: none;
`;
