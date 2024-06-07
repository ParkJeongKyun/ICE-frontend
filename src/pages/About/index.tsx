import React from 'react';
import { useTransform, useScroll } from 'framer-motion';
import { useRef } from 'react';
import {
  AnimatedHeading,
  AppContainer,
  TabletContainer,
  MainContainer,
  Section,
  TabletWrapper,
  ImageContainer,
} from './index.styles';
import { calculateExperience } from 'utils/getDate';
import ICEMarkDown from 'components/markdown';
import DownArrowIcon from 'components/common/Icons/DownArrowIcon';

const txt = `
# 박정균(Park Jeong-kyun, 朴正均)
"신독(愼獨) - 홀로 있을 때에도 도리에 어그러짐이 없도록 몸가짐을 바로 하고 언행을 삼감."    
"권선징악(勸善懲惡) - 착한 일을 권장하고 악한 일을 징계함."    
"선인선과(善因善果) - 선업을 쌓으면 반드시 좋은 과보가 따름."    
### 출생
  - 2001년 2월 23일 (만 ${new Date().getFullYear() - new Date('2001-02-23').getFullYear()}세)
  - 대한민국 대구광역시 중구 대봉동
### 거주지
  - 대한민국 서울특별시 서대문구
### 이메일
  - dbzoseh84@gmail.com
  - jk.park@nuriggum.com
### 관심 분야
  - 디지털 포렌식, 보안, 웹
### 학력
  - 대구초등학교(졸업)
  - 대구제일중학교(졸업)
  - 협성고등학교(졸업)
  - 영진직업전문학교(고교위탁 학생 졸업)
### 병역
  - 대한민국 해군 3함대사령부 CERT(정보보호병) 병장 전역
    - 2020년 11월 23일 ~ 2022년 07월 22일
    - ${calculateExperience(new Date('2020-11-23'), new Date('2022-07-22'))}
### 업무 경력
  - 대한민국 해군 3함대사령부 사이버방호과
    - CERT/사이버보안관제
    - 2021년 01월 25일 ~ 2022년 07월 22일
    - ${calculateExperience(new Date('2021-01-25'), new Date('2022-07-22'))}
  - NuriggumSoft(주) DX 개발팀
    - SI, UI/UX, 웹, 파이썬 개발
    - 2022년 07월 25일 ~ 현재 재직중
    - ${calculateExperience(new Date('2022-07-25'), new Date())}
### 보유 자격
  - 디지털포렌식전문가 2급
  - 정보보안산업기사
  - 정보처리산업기사
  - 리눅스마스터 2급
  - 네트워크관리사 2급

`;

// ### 프로젝트 경력

const About: React.FC = () => {
  return (
    <MainContainer>
      <AppContainer>
        <Section $bgColor={'var(--main-hover-color)'}>
          <div style={{ display: 'flex', alignItems: 'end', height: '100%' }}>
            <DownArrowIcon width={35} height={35} />
          </div>
        </Section>
        <Section $bgColor={'var(--main-bg-color)'}>
          <ImageContainer
            initial={{ opacity: 0, y: '5vh' }}
            whileInView={{ opacity: 1, y: '0' }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
          >
            <img src={'/images/digital_forensics.jpg'} alt={'test'} />
          </ImageContainer>
          <AnimatedHeading
            initial={{ opacity: 0, y: '10vh' }}
            whileInView={{ opacity: 1, y: '0' }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
          >
            Digital
            <br /> Forensics
          </AnimatedHeading>
        </Section>
        <Section $bgColor={'var(--main-bg-color)'}>
          <ImageContainer
            initial={{ opacity: 0, y: '5vh' }}
            whileInView={{ opacity: 1, y: '0' }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
          >
            <img src={'/images/developer.jpg'} alt={'test'} />
          </ImageContainer>
          <AnimatedHeading
            initial={{ opacity: 0, y: '10vh' }}
            whileInView={{ opacity: 1, y: '0' }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
          >
            Developer
          </AnimatedHeading>
        </Section>
        <Section $bgColor={'var(--main-bg-color_reverse)'}>
          <TabletContainer
            initial={{ opacity: 0, x: '10vw' }}
            whileInView={{ opacity: 1, x: '0' }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
          >
            <TabletWrapper>
              <ICEMarkDown defaultText={txt} />
            </TabletWrapper>
          </TabletContainer>
        </Section>
      </AppContainer>
    </MainContainer>
  );
};

export default About;
