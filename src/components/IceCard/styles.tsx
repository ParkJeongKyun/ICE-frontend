import { Card } from "antd";
import styled from "styled-components";

// 메인 컨테이너
export const IceCard = styled(Card)`
  background-color: var(--container-bg-color);
  border: var(--main-border-size) solid var(--container-line-color);
  border-radius: var(--container-radius-size);
  color: var(--container-text-color);

  & .ant-card-body {
    color: var(--container-text-color);
  }

  & .ant-card-meta-title {
    color: var(--container-text-color);
  }

  & .ant-card-meta-description {
    color: var(--container-text-color);
  }

  & .ant-card-actions {
    background-color: transparent;
  }
`;

// #rc-tabs-1-panel-1 > div > ul > li:nth-child(1) > span
