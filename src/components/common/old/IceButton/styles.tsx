import { Button } from "antd";
import styled from "styled-components";

// 메인 컨테이너
export const IceButton = styled(Button)`
  border-radius: var(--container-radius-size);

  background-color: var(--container-bg-color);
  border: var(--main-border-size) solid var(--container-line-color);
  color: var(--container-text-color);
`;
