import styled from 'styled-components';

const About: React.FC = () => {
  return (
    <>
      <MainContainer>
        <Container>
          <LaptopContainer>
            <DemoContainer>
              <Wrapper></Wrapper>
            </DemoContainer>
          </LaptopContainer>
        </Container>
      </MainContainer>
    </>
  );
};

export default About;

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #4f5a5a;
`;

const Container = styled.div`
  width: 95%;
  height: 100vh;
  position: relative;
`;

const LaptopContainer = styled.div`
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

const DemoContainer = styled.div`
  background-color: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
  width: 100%;
  opacity: 1;
`;

const Wrapper = styled.div`
  display: inline-block;
  background-color: #fff;
  height: 70vh;
  width: 100%;
`;
