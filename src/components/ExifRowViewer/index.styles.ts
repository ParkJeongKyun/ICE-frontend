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

export const ThumbDiv = styled.div`
  text-align: center;
  align-items: center;
`;

export const Thumbnail = styled.img`
  max-height: 150px;
  border: 1px solid var(--main-line-color);
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
