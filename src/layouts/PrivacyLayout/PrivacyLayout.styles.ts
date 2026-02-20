import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  overflow-y: auto;
  background: var(--main-bg-color);
`;

export const LogoContainer = styled.div`
  display: flex;
  width: 100%;
  text-align: left;
  align-items: center;
  justify-content: flex-start; /* 좌측 정렬 */
  margin: 1rem;
  margin-bottom: 0.5rem;

  /* 로고 링크 밑줄 제거 및 색상 상속 */
  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const MarkdownBox = styled.div`
  max-width: 600px;
  text-align: left;
  background: var(--main-bg-color);
  color: var(--main-color);
  border-radius: 5px;
  transition: box-shadow 0.2s;
`;

export const Copyright = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--main-color-reverse);
  border-top: 1px solid var(--main-line-color);
  margin: 0.25rem;
  text-align: center;
`;
