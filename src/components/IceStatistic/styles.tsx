import { Statistic } from "antd";
import styled from "styled-components";

// 출력
export const IceStatistic = styled(Statistic)`
  padding: var(--main-padding-size);
  font-family: var(--main-font-family);

  & .ant-statistic-title {
    font-family: var(--main-font-family);

    font-size: var(--container-font-size);
    color: var(--container-highlight-color);
  }
  & .ant-statistic-content {
    font-family: var(--main-font-family);

    font-size: var(--container-big-font-size);
    color: var(--container-text-color);
  }
`;
