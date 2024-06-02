import ICEMarkDown from 'components/markdown';
import {
  Container,
  DemoContainer,
  LaptopContainer,
  MainContainer,
  Wrapper,
} from './index.styles';

const txt = `
# 박정균(Park Jeong-kyun, 朴正均)
- 출생
  - 2001년 2월 23일
  - 대한민국 대구광역시 중구 대봉동
- 거주지
  - 대한민국 서울특별시 서대문구
- 이메일
  - dbzoseh84@gmail.com
  - jk.park@nuriggum.com
- 분야
  - 디지털 포렌식, 보안, 웹
- 학력
  - 대구초등학교(졸업)
  - 대구제일중학교(졸업)
  - 협성고등학교(졸업)
  - 영진직업전문학교(고교위탁 학생 졸업)
- 병역
  - 대한민국 해군 3함대사령부 CERT(정보보호병) 병장 전역
- 업무 경력
  - 해군 3함대사령부 사이버 방호과
    - CERT/사이버보안관제
    - 2021. 01. 25 ~ 2022. 07. 22
  - NuriggumSoft(주) DX 개발팀
    - SI 개발, 웹 개발, 파이썬 개발
    - 2022. 07. 25 ~
- 프로젝트 경력
- 보유 자격
  - 디지털포렌식전문가 2급
  - 정보보안산업기사
  - 정보처리산업기사
  - 리눅스마스터 2급
  - 네트워크관리사 2급

`;

const About: React.FC = () => {
  return (
    <>
      <MainContainer>
        <Container>
          <LaptopContainer>
            <DemoContainer>
              <Wrapper>
                <ICEMarkDown defaultText={txt} childTexts={{}} />
              </Wrapper>
            </DemoContainer>
          </LaptopContainer>
        </Container>
      </MainContainer>
    </>
  );
};

export default About;
