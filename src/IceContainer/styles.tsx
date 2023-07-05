import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import styled from "styled-components";

// 메인 컨테이너
export const IceContainer = styled(Layout)`
  width: 400px;
  max-height: 80vh;
  position: fixed;
  overflow: auto;
  padding: 5px;
  background-color: var(--container-bg-color);
  border: 0.5px solid var(--container-line-color);
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); /* 그림자 효과 */

  /* 스크롤바 스타일 지정 */
  &::-webkit-scrollbar {
    width: 0em;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }
`;

// 컨테이너 프레임
export const IceFrame = styled(Content)`
  padding: 5px;
`;
