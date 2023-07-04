import { Image } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

export const LogoImage = styled(Image)`
  max-height: 40px;
`;

export const LogoContainer = styled(Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 35px;
  color: var(--container-line-color);
`;
