import styled from "styled-components";
import { animated } from "@react-spring/web";

export const Container = styled("div")`
  border: var(--main-border-size) solid var(--container-line-color);
  font-family: var(--main-font-family);
  border-radius: var(--container-radius-size);
  width: 100%;
  height: 100%;
  margin: 0px;
  margin-top: var(--main-big-padding-size);
  padding: 0px;
  padding-left: var(--main-big-padding-size);
  padding-right: var(--main-big-padding-size);
  padding-bottom: var(--main-big-padding-size);
  background-color: var(--ice-main-bg-color);
  overflow: hidden;
  font-size: var(--container-big-font-size);
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
  color: var(--container-text-color);
  fill: var(--container-text-color);
  max-height: 100%;
`;

export const Title = styled("span")`
  vertical-align: middle;
`;

export const Content = styled(animated.div)`
  will-change: transform, opacity, height;
  margin-left: var(--main-padding-size);
  padding: 0px 0px 0px var(--main-big-padding-size);
  border-left: var(--main-border-size) dashed var(--container-line-color);
  overflow: hidden;
`;

export const toggle = {
  width: "1em",
  height: "1em",
  marginRight: "var(--main-big-padding-size)",
  cursor: "pointer",
  verticalAlign: "middle",
};
