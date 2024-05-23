import styled from 'styled-components';
export const ViewerDiv = styled.div`
  height: 100%;
  width: 100%;
`;

export const ContentDiv = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

export const CellHeaderDiv = styled.div`
  text-align: left;
  font-size: 12px;
  min-width: 40%;
  font-weight: 500;
`;

export const CellBodyDiv = styled.div`
  text-align: left;
  font-size: 12px;
  min-width: 60%;
  color: var(--ice-main-color);
`;
