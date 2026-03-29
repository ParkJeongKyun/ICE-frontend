import styled from 'styled-components';

export const SelectionModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1100;
`;

export const SelectionModalBox = styled.div`
  position: fixed;
  bottom: 30px;
  left: 5px;
  width: 350px;
  max-height: 500px;
  background-color: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1101;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SelectionModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 26px;
  padding: 2px 8px;
  border-bottom: 1px solid var(--main-line-color);
`;

export const SelectionModalTitle = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const SelectionModalBody = styled.div`
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SelectionModalClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  padding: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

export const SelectionModalRow = styled.div`
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SelectionModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 6px;
`;

export const SelectionModeGroup = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 0;
  margin-bottom: 12px;
`;

export const SelectionModeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 8px;
  background: ${({ $active }) =>
    $active ? 'var(--main-hover-color)' : 'var(--main-bg-color)'};
  border: 1px solid var(--main-line-color);
  border-right: ${({ $active }) =>
    $active
      ? '1px solid var(--main-line-color)'
      : '1px solid var(--main-line-color)'};
  color: ${({ $active }) =>
    $active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  &:last-child {
    border-radius: 0 4px 4px 0;
    border-left: 0;
  }
  &:hover {
    background-color: var(--main-hover-color);
    color: var(--ice-main-color);
  }
`;

export const SelectionModalInput = styled.input`
  width: 100%;
  margin-top: 4px;
  box-sizing: border-box;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  background: var(--main-bg-color);
  color: var(--main-color);
  padding: 6px 8px;
`;

export const SelectionModalButton = styled.button`
  padding: 6px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  background: var(--main-hover-color);
  &:hover {
    background: var(--ice-main-color);
    color: var(--main-bg-color);
  }
`;
