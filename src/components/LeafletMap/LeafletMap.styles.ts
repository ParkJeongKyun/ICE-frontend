import styled from 'styled-components';

// 카카오 맵
export const IceMapContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

export const IceMap = styled.div`
  user-select: none;
  width: 100%;
  height: 150px;
`;

export const DisabledMapPlaceholder = styled.div`
  width: 100%;
  min-height: 150px;
  background-color: var(--main-hover-color);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--ice-main-color-warning);
  opacity: 0.7;
  text-align: center;

  svg {
    opacity: 0.5;
  }

  span {
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

export const AddressInfo = styled.div`
  padding: 5px 10px;
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
  line-height: 1.3;
  flex: 0 0 35%;
  font-weight: 500;
  padding: 2px 5px;
  word-break: break-all;
  overflow-wrap: break-word;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  &:hover {
    background-color: var(--main-hover-color);
  }
`;

export const CellBodyDiv = styled.div`
  border-radius: 2px;
  text-align: left;
  font-size: 0.75rem;
  line-height: 1.3;
  flex: 1;
  color: var(--ice-main-color);
  padding: 2px 5px;
  word-break: break-all;
  overflow-wrap: break-word;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  &:hover {
    background-color: var(--main-hover-color);
  }
`;
