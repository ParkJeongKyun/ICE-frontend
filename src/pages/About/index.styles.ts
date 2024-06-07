import styled from 'styled-components';
import { motion } from 'framer-motion';

export const MainContainer = styled.div`
  scroll-snap-type: y mandatory;
  /* background: var(--main-bg-color); */
  /* background: var(--main-bg-color);
  background: radial-gradient(
    circle,
    var(--main-bg-color) 50%,
    var(--main-hover-color) 100%
  ); */
  color: var(--main-color);
`;

export const AppContainer = styled.div`
  font-family: sans-serif;
  text-align: center;
`;

export const Section = styled.section<{ $bgColor?: string }>`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: center;
  perspective: 500px;
  overflow: hidden;
  background: ${(props) =>
    props.$bgColor ? props.$bgColor : `var(--main-bg-color)`};
`;

export const ImageContainer = styled(motion.div)`
  width: 300px;
  height: 400px;
  position: relative;
  max-height: 90vh;
  margin: 20px;
  overflow: hidden;
  border-radius: 5px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const AnimatedHeading = styled(motion.h2)`
  margin: 0;
  color: var(--ice-main-color_3);
  text-shadow: 1px 1px 2px var(--main-bg-color);
  left: calc(50% - 50px);
  top: calc(50%);
  font-size: 50px;
  font-weight: 700;
  font-family: consolas;
  font-style: normal;
  letter-spacing: -2px;
  line-height: 1.2;
  position: absolute;
`;

export const TabletContainer = styled(motion.div)`
  background-color: #000;
  border: 4px solid #707070;
  border-radius: 20px;
  box-shadow: 0 0 20px 2px rgba(28, 31, 47, 0.1);
  padding: 10px 10px;
  width: 90vw;
  max-width: 600px;
  height: 500px;
  position: relative;
  max-height: 90vh;
  margin: 20px;
  overflow: hidden;
`;

export const TabletWrapper = styled.div`
  display: inline-block;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
`;
