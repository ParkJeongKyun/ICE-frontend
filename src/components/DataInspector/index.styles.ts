import styled from 'styled-components';

export const NotSelectedDiv = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--ice-main-color);
  margin: 4px 0 2px 0;
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

export const EndianRadioGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-bottom: 10px;
  user-select: none;
`;

export const EndianLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--ice-main-color);
  cursor: pointer;
  gap: 4px;
`;

export const EndianRadio = styled.input.attrs({ type: 'radio' })`
  accent-color: var(--ice-main-color);
  margin-right: 4px;
`;

export const SectionDiv = styled.div`
  padding: 5px 0px;
  border-top: 1px solid var(--main-line-color);
`;
