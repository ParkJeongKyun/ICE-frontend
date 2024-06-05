import styled from 'styled-components';

export const HomeDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  > div {
    width: 70%;
    height: 85%;
    text-align: left;
  }
`;

export const Title = styled.div`
  font-size: 45px;
  font-weight: 600;
  color: var(--ice-main-color);
`;

export const Version = styled.span`
  margin-left: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--main-color_1);
`;

export const SubTitle = styled.div`
  margin-left: 5px;
  font-size: 16px;
  font-weight: 600;
  color: var(--main-color);
`;

export const StartDiv = styled.div`
  margin-left: 5px;
  margin-top: 50px;
  font-size: 20px;
  font-weight: 600;
  color: var(--ice-main-color_3);
`;

export const Btn = styled.div`
  margin: 3px 0px;
  font-size: 15px;
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
  margin-top: 100px;
  font-size: 12px;
  font-weight: 500;
  color: var(--main-color);
  > div {
    margin: 5px 0px;
  }
  > div:last-child {
    margin-top: 15px;
    color: var(--main-color_1);
  }
`;
