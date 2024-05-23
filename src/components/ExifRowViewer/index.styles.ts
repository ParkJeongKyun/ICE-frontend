import styled from 'styled-components';
export const ViewerDiv = styled.div`
  height: 100%;
  width: 100%;
`;

export const ContentDiv = styled.div`
  display: flex;
  gap: 5px;
`;

export const CellDiv = styled.div<{ isHeader?: boolean }>`
  text-align: left;
  font-size: 14px;
  min-width: 50%;
`;
