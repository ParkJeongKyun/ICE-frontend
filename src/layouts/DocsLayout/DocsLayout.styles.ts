import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  background: var(--main-bg-color);
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  width: 100%;
  height: 100%;
  text-align: left;
  background: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
  transition: box-shadow 0.2s;

  @media (min-width: 1024px) {
    max-width: 1200px;
  }
`;

export const IntroContainer = styled.div`
  padding: 1rem;
`;

export const LogoContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  text-align: left;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;

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
  border-top: 1px solid var(--main-line-color);
  margin: 0.25rem;
  text-align: center;
`;

export const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1 1 0; /* each tab takes equal share */
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: ${({ $active }) =>
    $active ? 'var(--ice-main-color)' : 'var(--main-color)'};
  border-bottom: 2px solid
    ${({ $active }) => ($active ? 'var(--ice-main-color)' : 'transparent')};
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: var(--ice-main-color);
  }
  @media (max-width: 580px) {
    padding: 0.5rem 0rem;
  }
`;

export const TabContents = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  /* ensure content fills remaining space without overshoot */
  min-height: 0;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: row;
    overflow-y: hidden;
    gap: 1rem;
    padding: 0 1rem;
  }
`;

export const TabContent = styled.div<{ $active?: boolean }>`
  display: ${({ $active }) => ($active ? 'block' : 'none')};

  @media (min-width: 1024px) {
    display: block !important;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  &:nth-child(2) {
    @media (min-width: 1024px) {
      border-left: 1px solid var(--main-line-color);
      padding-left: 1rem;
    }
  }
`;

export const TabContentTitle = styled.div`
  display: none;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ice-main-color);
  padding: 1rem 1rem 0.75rem 1rem;
  margin-bottom: 0;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid var(--main-line-color);
  background-color: var(--main-bg-color);
  z-index: 10;
  text-align: center;

  @media (min-width: 1024px) {
    display: block;
  }
`;
