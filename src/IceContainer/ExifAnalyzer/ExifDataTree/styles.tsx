import styled from "styled-components";
import { animated } from "@react-spring/web";

export const Container = styled("div")`
  border: 0.5px solid var(--ice-line-color);
  font-family: "Roboto Mono";
  border-radius: 10px;
  width: 100%;
  height: 100%;
  margin: 0px;
  margin-top: 5px;
  padding: 0px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 5px;
  background: var(--container-bg-color);
  overflow: hidden;
  font-size: var(--main-font-size);
  line-height: 21px;
  --webkit-user-select: none;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: start;
`;

export const Frame = styled("div")`
  position: relative;
  padding: 4px 0px 0px 0px;

  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;

  overflow-x: hidden;
  vertical-align: middle;
  color: var(--continaer-text-color);
  fill: var(--continaer-text-color);
  max-height: 100%;
`;

export const Title = styled("span")`
  vertical-align: middle;
`;

export const Content = styled(animated.div)`
  will-change: transform, opacity, height;
  margin-left: 6px;
  padding: 0px 0px 0px 14px;
  border-left: 1px dashed var(--continaer-text-color);
  overflow: hidden;
`;

export const toggle = {
  width: "1em",
  height: "1em",
  marginRight: 10,
  cursor: "pointer",
  verticalAlign: "middle",
};
