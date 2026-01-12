import styled from 'styled-components';

// 카카오 맵
export const IceMapContainer = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

export const IceMap = styled('div')`
  width: 100%;
  height: 150px;
`;

export const ContentDiv = styled.div`
  display: flex;
  gap: 5px;
  width: 100%;
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