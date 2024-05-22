import styled from 'styled-components';

export const Row = styled.div`
  display: flex;
  font-family: monospace;
`;

export const OffsetCell = styled.div`
  width: 80px;
  color: var(--ice-main-color);
`;

export const HexCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 320px;
`;

export const TextCell = styled.div`
  width: 160px;
`;

export const HexByte = styled.span`
  display: inline-block;
  width: 2ch;
  margin: 2px;
  text-align: center;
  &.hovered {
    background-color: var(--main-hover-color);
  }
`;

export const TextByte = styled.span`
  display: inline-block;
  width: 1ch;
  margin: 1px;
  text-align: center;
  color: var(--ice-main-color);
  &.hovered {
    background-color: var(--main-hover-color);
  }
  &.isDot {
    color: var(--main-line-color);
  }
`;
