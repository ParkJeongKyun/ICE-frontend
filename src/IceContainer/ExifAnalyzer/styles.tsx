import { Card, Col, Row, Statistic } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

export const IceExifInfo = styled(Content)`
  padding: 10px;
  margin: 0px;
  margin-top: 10px;
  background-color: var(--container-bg-color);
  border-radius: 10px;
  border: 0.5px solid var(--container-line-color);
`;

export const IceImageInfo = styled(Card)`
  padding: 0px;
  margin: 0px;
  margin-bottom: 10px;
  // background-color: var(--container-bg-color);
  background-color: var(--ice-main-bg-color);
  // background-color: transparent;
  border-radius: 10px;
  border: 0.5px solid var(--container-line-color);

  & .ant-card-body {
    padding: 5px;
    // margin: 2.5px;
  }
`;

export const IceStatistic = styled(Statistic)`
  padding: 5px;
  font-family: "Roboto Mono";
  & .ant-statistic-title {
    font-size: 11px;
    color: var(--ice-main-color);
  }
  & .ant-statistic-content {
    font-size: 14px;
    color: var(--ice-text-color);
  }
`;
