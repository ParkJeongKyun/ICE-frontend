import styled from 'styled-components';

export const ContentDiv = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

export const CellHeaderDiv = styled.div`
  text-align: left;
  font-size: 0.75rem;
  min-width: 40%;
  font-weight: 500;
  &:hover {
    background-color: var(--main-hover-color);
  }
`;

export const CellBodyDiv = styled.div`
  text-align: left;
  font-size: 0.75rem;
  min-width: 60%;
  color: var(--ice-main-color);
  &:hover {
    background-color: var(--main-hover-color);
  }
  word-wrap: break-word;
`;

export const EndianRadioGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px;
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
  margin-bottom: 12px;
`;

export const SectionTitleDiv = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
  margin: 8px 0 4px 0;
  color: var(--ice-main-color);
`;
