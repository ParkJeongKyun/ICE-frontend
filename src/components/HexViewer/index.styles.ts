import { List } from 'react-virtualized';
import styled from 'styled-components';

export const ListDiv = styled(List)`
  padding: 10px;
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
  color: var(--ice-main-color);
`;

export const HexCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  align-items: center;
`;

export const TextCell = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
`;

export const HexByte = styled.span<{ $selected: boolean }>`
  cursor: text;
  display: inline-block;
  min-height: 17px;
  width: 2ch;
  padding: 2px;
  text-align: center;

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

  /* 선택된 셀 */
  ${(props) => props.$selected && 'background-color: var(--main-hover-color);'}
  /* 점인 경우 */
  ${(props) =>
    props.$isDot
      ? 'color: var(--main-line-color);'
      : 'color: var(--ice-main-color);'}
`;
