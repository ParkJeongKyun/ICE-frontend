import styled from 'styled-components';
export const ViewerDiv = styled.div`
  height: 100%;
  width: 100%;
`;

export const ContentDiv = styled.div`
  display: flex;
  gap: 5px;
  width: 100%;
`;

export const ThumbDiv = styled.div`
  width: 100%;
  text-align: center;
  align-items: center;
`;

export const Thumbnail = styled.img`
  max-width: 100%;
  max-height: 150px;
  border: 1px solid var(--main-line-color);
`;

export const CellHeaderDiv = styled.div`
  border-radius: 2px;
  text-align: left;
  font-size: 0.75rem;
  flex: 0 0 40%;
  font-weight: 500;
  padding: 2px 5px;
  &:hover {
    background-color: var(--main-hover-color);
  }
`;

export const CellBodyDiv = styled.div`
  border-radius: 2px;
  text-align: left;
  font-size: 0.75rem;
  flex: 1;
  color: var(--ice-main-color);
  padding: 2px 5px;
  &:hover {
    background-color: var(--main-hover-color);
  }
`;
