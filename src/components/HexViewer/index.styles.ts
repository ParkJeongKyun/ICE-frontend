import { List } from 'react-virtualized';
import styled from 'styled-components';

export const ListDiv = styled(List)`
  padding: 5px 5px;
  /* 선택 비활성화 */
  user-select: none;
  scroll-snap-type: y mandatory;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: nowrap;
  font-family: monospace;
  font-weight: 600;
  text-align: center;
  align-items: center;
  gap: 0px 10px;
`;

export const OffsetCell = styled.div`
  display: flex;
  flex-wrap: nowrap;
  text-align: center;
  align-items: center;
`;

export const HexCell = styled.div`
  display: flex;
  flex-wrap: nowrap;
  text-align: center;
  width: 320px;
  align-items: center;
`;

export const TextCell = styled.div`
  display: flex;
  flex-wrap: nowrap;
  text-align: center;
  align-items: center;
`;

export const OffsetByte = styled.span<{ $selected: boolean }>`
  cursor: text;
  display: inline-block;
  min-height: 17px;
  padding: 3px;
  text-align: center;

  color: var(--ice-main-color_3);
  /* 선택된 셀 */
  ${(props) =>
    props.$selected &&
    `
      background-color: var(--main-hover-color);
      // color: var(--ice-main-color);
    `}
`;

export const HexByte = styled.span<{ $isEven: boolean; $selected: boolean }>`
  cursor: text;
  display: inline-block;
  min-height: 17px;
  padding: 3px 2px;
  text-align: center;
  width: 2ch;

  /* 텍스트 색변경 */
  ${(props) =>
    props.$isEven ? 'color: var(--main-color);' : 'color: var(--main-color_1);'}

  /* 선택된 셀 */
  ${(props) =>
    props.$selected &&
    `
    background-color: var(--main-hover-color);
    color: var(--ice-main-color)
  `}
`;

export const TextByte = styled.span<{ $isDot: boolean; $selected: boolean }>`
  cursor: text;
  display: inline-block;
  min-height: 17px;
  width: 1ch;
  padding: 3px 0px;
  text-align: center;

  /* 점인 경우 */
  ${(props) =>
    props.$isDot
      ? 'color: var(--main-disabled-color);'
      : 'color: var(--main-color);'}

  /* 선택된 셀 */
  ${(props) =>
    props.$selected &&
    `
      background-color: var(--main-hover-color);
      color: var(--ice-main-color_2)
    `}
`;
