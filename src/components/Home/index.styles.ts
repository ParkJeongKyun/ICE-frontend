import styled from 'styled-components';

export const IceWelcome = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  > div {
    width: 100%;
    > span {
      font-size: 50px;
      font-weight: 600;
      color: var(--ice-main-color);
      text-decoration: underline;
      cursor: pointer;
    }
  }
`;
