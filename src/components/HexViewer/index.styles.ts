import { List } from 'react-virtualized';
import styled from 'styled-components';

export const ListDiv = styled(List)`
  padding: 5px 5px;
  /* 선택 비활성화 */
  user-select: none;
`;

export const Row = styled.div`
  display: flex;
  font-family: monospace;
  text-align: center;
  align-items: center;
  gap: 0px 10px;
`;

export const OffsetCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  align-items: center;
`;

export const HexCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  width: 288px;
  align-items: center;
`;

export const TextCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  align-items: center;
`;

export const OffsetByte = styled.span<{ $selected: boolean }>`
  cursor: text;
  display: inline-block;
  min-height: 17px;
  padding: 2px;
  text-align: center;

  color: var(--ice-main-color_1);
  font-weight: 400;
  /* 선택된 셀 */
  ${(props) =>
    props.$selected &&
    `
      background-color: var(--main-hover-color);
      color: var(--ice-main-color);
    `}
`;

export const HexByte = styled.span<{ $selected: boolean }>`
  cursor: text;
  display: inline-block;
  min-height: 17px;
  padding: 2px;
  text-align: center;
  width: 2ch;

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
  padding: 2px 1px;
  text-align: center;

  /* 점인 경우 */
  ${(props) =>
    props.$isDot
      ? 'color: var(--main-disabled-color);'
      : 'color: var(--ice-main-color_3);'}

  /* 선택된 셀 */
  ${(props) =>
    props.$selected &&
    `
      background-color: var(--main-hover-color);
      color: var(--ice-main-color)
    `}
`;
