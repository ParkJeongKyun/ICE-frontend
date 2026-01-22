import styled from 'styled-components';

export const ModalContainer = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1200;
`;

export const ModalContent = styled.div<{ $top: string; $left: string }>`
  font-size: 0.75rem;
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  transform: ${({ $top, $left }) => `translate(-${$top}, -${$left})`};
  background-color: var(--main-bg-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: 1px solid var(--main-line-color);
  width: 80vw;
  max-width: 800px;
`;

export const ChildDiv = styled.div`
  height: 70vh;
  max-height: 800px;
  padding: 6px;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 26px;
  padding: 2px 8px;
  border-bottom: 1px solid var(--main-line-color);
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const CloseBtn = styled.div`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--main-color);
  padding: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  border-radius: 3px;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;
