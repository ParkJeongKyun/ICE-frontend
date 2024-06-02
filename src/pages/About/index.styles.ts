import styled from 'styled-components';

export const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--main-bg-color_1);
`;

export const Container = styled.div`
  width: 95%;
  height: 100vh;
  position: relative;
`;

export const LaptopContainer = styled.div`
  background-color: #000;
  border: 4px solid #707070;
  bottom: 0px;
  border-bottom: 0;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  box-shadow: 0 0 40px 2px rgba(28, 31, 47, 0.1);
  font-size: 1.5rem;
  padding: 20px 20px 0;
  position: absolute;
  width: 100%;
  box-sizing: border-box;
`;

export const DemoContainer = styled.div`
  background-color: var(--main-bg-color);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
  width: 100%;
  opacity: 1;
`;

export const Wrapper = styled.div`
  display: inline-block;
  height: 90vh;
  width: 100%;
  background-color: var(--main-bg-color);
  color: var(--main-color);
`;
