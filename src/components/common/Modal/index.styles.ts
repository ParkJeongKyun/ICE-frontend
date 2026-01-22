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
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: 1px solid var(--main-line-color);
  width: 80vw;
  max-width: 800px;
`;

export const ChildDiv = styled.div`
  height: 70vh;
  max-height: 800px;
  border: 1px solid var(--main-line-color);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--main-line-color);
  padding-bottom: 10px;
  margin-bottom: 10px;
`;

export const CloseBtn = styled.div`
  margin-left: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
  svg {
    stroke: var(--main-line-color);
  }
  &:hover {
    svg {
      stroke: var(--ice-main-color); // 호버 시 아이콘 컬러 변경
    }
  }
`;
