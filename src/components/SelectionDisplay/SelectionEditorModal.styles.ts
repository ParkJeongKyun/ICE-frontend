import { BREAKPOINTS } from '@/layouts/MainLayout/MainLayout.styles';
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

  @media (max-width: ${BREAKPOINTS.mobile}) {
    position: fixed;
    bottom: 60px;
    left: 10px;
    right: 10px;
    width: auto;
    max-height: 60vh;
  }
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
  padding: 10px;
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

export const SelectionModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

export const SelectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

export const SelectionRowLabel = styled.div`
  min-width: 70px;
  max-width: 90px;
  font-size: 0.75rem;
  color: var(--main-color);
  font-weight: 600;
`;

export const SelectionRowInput = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0px;
`;

export const SelectionRadixButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 2px;
  color: var(--main-color);
  cursor: pointer;
  opacity: 0.6;
  font-size: 0.65rem;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 1;
    color: var(--ice-main-color);
  }
`;

export const SelectionModalInput = styled.input`
  flex: 1;
  min-width: 20px;
  width: 100%;
  color: var(--main-color);
  background-color: var(--main-bg-color);
  border: none;
  border-bottom: 1px solid var(--main-line-color);
  box-sizing: border-box;
  font-size: 0.75rem;
  &:focus,
  &:hover {
    outline: none;
    background-color: var(--main-hover-color-primary);
  }

  &::placeholder {
    font-size: 0.65rem;
    opacity: 0.5;
  }
`;

export const SelectionModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
`;

export const SelectionModeGroup = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  gap: 0px;
  user-select: none;
  width: 100%;
  border-bottom: 1px solid var(--main-line-color);
  > * {
    flex: 1;
  }
`;

export const SelectionModeButton = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 0px;
  color: var(--main-color);
  opacity: ${(props) => (props.$active ? 1 : 0.4)};
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

export const SelectionModalButton = styled.button`
  padding: 4px 6px;
  border: 1px solid var(--main-line-color);
  border-radius: 4px;
  background: transparent;
  color: var(--main-color);
  font-size: 0.68rem;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;

  &:hover:not(:disabled) {
    border-color: var(--ice-main-color);
    color: var(--ice-main-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
