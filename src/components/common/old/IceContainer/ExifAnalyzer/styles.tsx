import { Card } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

// EXIF 정보 출력
export const IceExifInfo = styled(Content)`
  padding: var(--main-big-padding-size);
  margin: 0px;
  margin-top: var(--main-big-padding-size);

  border-radius: var(--container-radius-size);

  background-color: var(--container-bg-color);
  border: var(--main-border-size) solid var(--container-line-color);
`;

// 이미지 정보
export const IceImageInfo = styled(Card)`
  padding: 0px;
  margin: 0px;
  margin-bottom: var(--main-big-padding-size);

  border-radius: var(--container-radius-size);

  background-color: var(--ice-main-bg-color);
  border: var(--main-border-size) solid var(--container-line-color);

  & .ant-card-body {
    padding: var(--main-padding-size);
  }
`;