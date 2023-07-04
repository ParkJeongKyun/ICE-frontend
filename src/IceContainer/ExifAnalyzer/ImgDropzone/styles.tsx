import { Image } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

export const IceDropzone = styled("div")`
  height: 200px;
  border-radius: 10px;
  background: var(--ice-main-bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0.5px solid var(--container-line-color);
  color: var(--container-line-color);
`;

export const StyledImage = styled(Image)`
  max-height: 180px;
  border: 0.5px solid var(--container-line-color);
`;
