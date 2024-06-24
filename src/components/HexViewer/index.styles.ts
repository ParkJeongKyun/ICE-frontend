import styled from 'styled-components';
import { Grid } from 'react-virtualized';

// 리스트 가상화 디자인
export const GridDiv = styled(Grid)`
  /* 선택 비활성화 */
  user-select: none;
  scroll-snap-type: y mandatory;

  /* 스크롤 디자인 */
  // Chrome, Safari, Edge, Opera
  &::-webkit-scrollbar {
    display: block !important;
    width: 10px; /* 스크롤바 너비 */
    height: 10px; /* Scrollbar 높이 */
    /* background-color: rgba(255, 255, 255, 0.1); */
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3); /* 스크롤바 색상 */
    &:hover {
      /* 마우스 호버시 스크롤바 색상 */
      background-color: var(--main-hover-line-color);
    }
  }
  &::-webkit-scrollbar-corner {
    /* background-color: rgba(255, 255, 255, 0.3); */
    background-color: transparent;
  }
  /* 스크롤 디자인 */
`;

// 오프셋 셀
export const OffsetCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  flex-wrap: nowrap;
  text-align: center;

  /* 폰트 */
  font-family: monospace;
  font-weight: 600;
  font-size: 14.5px;
`;

// 헥스 셀
export const HexCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  flex-wrap: nowrap;
  text-align: center;

  /* 폰트 */
  font-family: monospace;
  font-weight: 600;
  font-size: 14.5px;
`;

// 텍스트 셀
export const TextCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  flex-wrap: nowrap;
  text-align: center;

  /* 폰트 */
  font-family: monospace;
  font-weight: 600;
  font-size: 12.5px;
`;

// 오프셋
export const OffsetByte = styled.span<{ $selected: boolean }>`
  cursor: text;
  display: inline;
  margin-left: 10px;
  width: 70px;
  line-height: 30px;

  color: var(--ice-main-color_3);
  /* 선택된 셀 */
  ${(props) =>
    props.$selected &&
    `
      background-color: var(--main-hover-color);
      // color: var(--ice-main-color);
    `}
`;

// 헥스
export const HexByte = styled.span<{ $isEven: boolean; $selected: boolean }>`
  cursor: text;
  display: inline;
  width: 22px;
  line-height: 30px;

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

// 텍스트
export const TextByte = styled.span<{ $isDot: boolean; $selected: boolean }>`
  cursor: text;
  display: inline;
  width: 10px;
  line-height: 30px;
  /* 공백인 경우 */
  min-height: 30px;

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
