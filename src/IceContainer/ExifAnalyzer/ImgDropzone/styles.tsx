import { Image } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

export const IceDropzone = styled("div")`
  display: flex;

  height: var(--container-frame-height-size);

  font-family: var(--main-font-family);
  font-size: var(--container-big-font-size);

  border-radius: var(--container-radius-size);

  justify-content: center;
  align-items: center;

  background: var(--ice-main-bg-color);
  border: var(--main-border-size) solid var(--container-line-color);
  color: var(--container-line-color);
`;

export const StyledImage = styled(Image)`
  max-height: var(--container-img-height-size);
  border: var(--main-border-size) solid var(--container-line-color);
`;
