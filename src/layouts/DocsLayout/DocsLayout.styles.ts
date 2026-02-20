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

export const LogoContainer = styled.div`
  display: flex;
  width: 100%;
  text-align: left;
  align-items: center;
  justify-content: flex-start; /* 좌측 정렬 */
  margin: 1rem;

  /* 로고 링크 밑줄 제거 및 색상 상속 */
  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const Copyright = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--main-color-reverse);
  margin: 0.25rem;
`;
