import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--main-bg-color);
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 500px;
  background: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    max-width: 1200px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
  background: var(--main-bg-color);
  z-index: 100;
  border-bottom: 1px solid var(--main-line-color);

  @media (max-width: 480px) {
    padding: 0.75rem 0.5rem;
    gap: 4px;
  }

  a {
    text-decoration: none;
    color: inherit;
    flex-shrink: 0;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;

  @media (max-width: 1023px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

export const Sidebar = styled.aside`
  width: 300px;
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
  border-right: 1px solid var(--main-line-color);
  box-sizing: border-box;

  @media (max-width: 1023px) {
    width: 100%;
    height: auto;
    overflow-y: visible;
    padding: 1.5rem 1rem;
    border-right: none;
    border-bottom: 1px solid var(--main-line-color);
  }
`;

export const MainContent = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 2rem 3rem;
  scroll-behavior: smooth;
  box-sizing: border-box;

  @media (max-width: 1023px) {
    padding: 1.5rem 1rem;
    overflow-y: visible;
  }
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--main-color);
  line-height: 1.2;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

export const LastUpdated = styled.p`
  font-size: 0.85rem;
  color: var(--main-color-reverse);
  margin-bottom: 2rem;
  font-weight: 500;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

export const NavItem = styled.div<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: ${(props) =>
    props.$active ? 'var(--main-color)' : 'var(--main-color-reverse)'};
  background: ${(props) =>
    props.$active ? 'var(--main-line-color)' : 'transparent'};
  font-weight: ${(props) => (props.$active ? '700' : '500')};
  margin-bottom: 0.25rem;
  word-break: keep-all;
  overflow-wrap: break-word;
  box-sizing: border-box;

  &:hover {
    background: var(--main-line-color);
    color: var(--main-color);
  }

  @media (max-width: 1023px) {
    padding: 0.6rem 0.8rem;
  }
`;

export const Section = styled.section`
  margin-bottom: 4rem;
  scroll-margin-top: 1rem;

  &:last-of-type {
    margin-bottom: 2rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--main-line-color);
  color: var(--main-color);
  letter-spacing: -0.01em;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

export const SectionContent = styled.div`
  font-size: 1rem;
  line-height: 1.7;
  color: var(--main-color);
  text-align: left;
  word-break: keep-all;
  overflow-wrap: break-word;

  p {
    margin-bottom: 1rem;
    opacity: 0.9;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 1.5rem;
  }

  strong {
    font-weight: 700;
    color: var(--main-color);
    margin-right: 0.2rem;
  }
`;

export const ListItem = styled.li`
  margin-bottom: 0.75rem;
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.6;
  word-break: keep-all;
  overflow-wrap: break-word;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--main-color-reverse);
    font-weight: bold;
    opacity: 0.6;
  }
`;

export const ImportantBox = styled.div`
  background: var(--main-line-color);
  padding: 1.25rem 1.5rem;
  border-left: 4px solid var(--main-color-reverse);
  border-radius: 8px;
  margin: 2rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
`;

export const Copyright = styled.div`
  margin-top: 4rem;
  padding: 2rem 0;
  border-top: 1px solid var(--main-line-color);
  color: var(--main-color-reverse);
  font-size: 0.85rem;
  text-align: center;
  font-weight: 500;
`;
