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

export const Card = styled.div`
  margin: 1rem;
  padding: 1.25rem;
  max-width: 500px;
  text-align: left;
  background: var(--main-bg-color);
  color: var(--main-color);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow-y: auto;
  transition: box-shadow 0.2s;
`;
