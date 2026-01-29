import styled from 'styled-components';

export const HomeDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  flex-grow: 1;
  user-select: none;
`;

export const ContientDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 70%;
  height: 70%;
  text-align: left;
  gap: 4rem;
`;

export const TitleDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.div`
  display: flex;
  align-items: baseline;
  font-size: 2.75rem;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const Version = styled.div`
  flex-grow: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--main-color_1);
`;

export const SubTitleDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0.25rem 1rem;
  gap: 0.1rem;
`;

export const SubTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--main-color);
`;

export const StartDiv = styled.div`
  margin: 0.25rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ice-main-color_3);
`;

export const Btn = styled.div`
  margin: 0.25rem 1rem;
  font-size: 1rem;
  color: var(--ice-main-color);
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    color: var(--main-hover-line-color);
    text-decoration: none;
  }
`;

export const InfoDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--main-color);
  > div:last-child {
    padding: 1rem 0;
    color: var(--main-color_1);
  }
`;
