import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background: var(--main-bg-color);
`;

export const MarkdownBox = styled.div`
  margin: 40px 0;
  border: 1px solid var(--ice-main-color);
  max-width: 800px;
  background: var(--main-bg-color);
  color: var(--main-color);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 40px 32px;
  overflow-y: auto;
  max-height: 80vh;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.13);
  }
`;
