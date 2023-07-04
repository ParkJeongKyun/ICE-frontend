import { Col, Row } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

export const IceExifInfo = styled(Content)`
  padding: 5px;
  margin: 0px;
  margin-top: 10px;
  background-color: var(--container-bg-color);
  border-radius: 10px;
  border: 0.5px solid var(--ice-line-color);
`;

export const IceRow = styled(Row)`
  padding: 5px;
`;

export const IceCol = styled(Col)`
  font-family: "Roboto Mono";
  &:nth-child(odd) {
    border-right: 2px solid var(--ice-line-color);
  }
`;
