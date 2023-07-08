import { Image } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

export const IceDropzone = styled("div")`
  height: var(--container-frame-height-size);
  border-radius: var(--container-radius-size);
  background: var(--ice-main-bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  border: var(--main-border-size) solid var(--container-line-color);
  color: var(--container-line-color);
`;

export const StyledImage = styled(Image)`
  max-height: var(--container-img-height-size);
  border: var(--main-border-size) solid var(--container-line-color);
`;
