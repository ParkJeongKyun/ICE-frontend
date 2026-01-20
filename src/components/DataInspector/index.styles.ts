import styled from 'styled-components';

export const NotSelectedDiv = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--ice-main-color);
  padding: 4px 0 2px 0;
  border-top: 1px solid var(--main-line-color);
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
  line-height: 1;
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
  word-break: break-all;
  overflow-wrap: break-word;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  line-height: 1;
  &:hover {
    background-color: var(--main-hover-color);
  }
`;

export const JumpButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    opacity: 1;
    color: var(--ice-main-color);
  }
`;

export const EndianRadioGroup = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  gap: 0px;
  user-select: none;
  width: 100%;
  > * {
    flex: 1;
  }
`;

export const EndianButton = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 0px;
  color: var(--main-color);
  opacity: ${props => props.$active ? 1 : 0.4};
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  
  border-top: 1px solid var(--main-line-color);
  
  &:hover {
    opacity: 1;
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

export const SectionDiv = styled.div`
  padding: 5px 0px;
  border-top: 1px solid var(--main-line-color);
`;
