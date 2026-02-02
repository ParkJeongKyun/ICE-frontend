'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  AppContainer,
  MainContainer,
  SectionTitle,
  List,
  ListItem,
  ScrollIndicator,
  HeroSection,
  AnimatedBg,
  SimpleListCard,
  SectionBlock,
} from './index.styles';
import Lanyard from './Lanyard';

const CURRENT_AGE = new Date().getFullYear() - 2001;

const EDUCATION = [
  {
    school: '고려사이버대학교',
    major: '정보관리보안학과',
    status: '4학년 재학',
    year: '2024 ~',
  },
  {
    school: '영진직업전문학교',
    major: '고교위탁 학생',
    status: '졸업',
    year: '2019',
  },
  { school: '협성고등학교', major: '', status: '졸업', year: '2020' },
];

const MILITARY = {
  service: '대한민국 해군 3함대사령부',
  position: 'CERT 정보보호병 병장',
  period: '2020.11.23 ~ 2022.07.22',
};

const CERTIFICATES = [
  '디지털포렌식전문가 2급',
  '정보보안기사',
  '정보보안산업기사',
  '정보처리산업기사',
  '리눅스마스터 2급',
  '네트워크관리사 2급',
];

const SKILLS = {
  언어: ['Python', 'TypeScript', 'JavaScript', 'Go', 'Java', 'HTML/CSS'],
  전문분야: ['디지털포렌식', '정보보안', '침해사고대응', '풀스택개발'],
};

const CAREERS = [
  {
    period: '2025.01 - 현재',
    company: 'Aimos(주) AI 플랫폼 개발팀',
    position: '프리랜서 개발자',
  },
  {
    period: '2024.07 - 2024.12',
    company: 'KG ITC',
    position: '프리랜서 개발자',
  },
  {
    period: '2022.07 - 2024.06',
    company: 'NuriggumSoft(주) DX 개발팀',
    position: '개발자',
  },
  {
    period: '2021.01 - 2022.07',
    company: '대한민국 해군 3함대사령부 사이버방호과',
    position: 'CERT/보안관제',
  },
];

const PROJECTS = [
  {
    name: '철 스크랩 Aimos 운영시스템',
    client: '대한제강, LG CNS, Aimos',
    role: '시스템 개발 및 운영',
    period: '2023.06 - 현재',
  },
  {
    name: '현대제철 야드비상조업',
    client: '현대제철, 현대ITC',
    role: 'JSP 웹 개발',
    period: '2023.06 - 2023.12',
  },
  {
    name: '현대 ITC 안전 보건 시스템',
    client: '현대ITC',
    role: 'React 웹 프론트엔드 개발',
    period: '2023.03 - 2023.06',
  },
  {
    name: '차세대 지방 재정 분석 시스템',
    client: '한국지역정보개발원',
    role: 'Jupyter Hub AI 분석 환경, Nifi 데이터 ETL',
    period: '2023.01 - 2023.08',
  },
  {
    name: 'AI Link On, Plant AI',
    client: 'LG 화학, LG CNS',
    role: 'Fast API 백엔드 개발',
    period: '2022.07 - 2022.12',
  },
];

// 태그 스타일 리스트
function TagList({ items }: { items: string[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4em',
        marginTop: '0.2em',
      }}
    >
      {items.map((item) => (
        <span
          key={item}
          style={{
            background: '#23243a',
            color: '#a5b4fc',
            borderRadius: '0.5em',
            padding: '0.18em 0.7em',
            fontSize: '0.98em',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            marginBottom: '0.2em',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

const About: React.FC = () => {
  const t = useTranslations('about');
  return (
    <MainContainer>
      <HeroSection>
        <AnimatedBg />
        <Lanyard position={[0, 0, 13]} gravity={[0, -40, 0]} />
        <ScrollIndicator>
          <svg className="arrow" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M12 19l-7-7M12 19l7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ScrollIndicator>
      </HeroSection>
      <AppContainer>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('personalInfo')}</SectionTitle>
            <List>
              <ListItem>
                <strong>{t('name')}</strong> 박정균 Park Jeong Kyun
              </ListItem>
              <ListItem>
                <strong>{t('dateOfBirth')}</strong> 2001년 2월 23일{' '}
                <span
                  style={{
                    color: '#a5b4fc',
                    marginLeft: 8,
                  }}
                >
                  (만 {CURRENT_AGE}
                  {t('age')})
                </span>
              </ListItem>
              <ListItem>
                <strong>{t('email')}</strong>{' '}
                <a
                  href="mailto:dbzoseh84@gmail.com"
                  style={{
                    color: '#a5b4fc',
                    textDecoration: 'underline',
                  }}
                >
                  dbzoseh84@gmail.com
                </a>
              </ListItem>
              <ListItem>
                <strong>{t('residence')}</strong> 서울특별시 강서구
              </ListItem>
              <ListItem>
                <strong>{t('birthplace')}</strong> 대구광역시 중구
              </ListItem>
            </List>
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('certificates')}</SectionTitle>
            <TagList items={CERTIFICATES} />
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('education')}</SectionTitle>
            <List>
              {EDUCATION.map((edu) => (
                <ListItem
                  key={edu.school + edu.year}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <span>
                    <strong>{edu.school}</strong>
                    {edu.major && (
                      <span
                        style={{
                          color: '#a5b4fc',
                          fontWeight: 400,
                        }}
                      >
                        {' '}
                        ({edu.major})
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: '0.97em',
                      color: '#b3b8d4',
                      marginTop: 2,
                    }}
                  >
                    {edu.status} <span style={{ margin: '0 0.5em' }}>|</span>{' '}
                    {edu.year}
                  </span>
                </ListItem>
              ))}
            </List>
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('military')}</SectionTitle>
            <List>
              <ListItem
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span>
                  <strong>{MILITARY.service}</strong>
                  <span
                    style={{
                      color: '#a5b4fc',
                      fontWeight: 400,
                    }}
                  >
                    {' '}
                    ({MILITARY.position})
                  </span>
                </span>
                <span
                  style={{
                    fontSize: '0.97em',
                    color: '#b3b8d4',
                    marginTop: 2,
                  }}
                >
                  {MILITARY.period}
                </span>
              </ListItem>
            </List>
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('expertise')}</SectionTitle>
            <TagList items={SKILLS.전문분야} />
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('languages')}</SectionTitle>
            <TagList items={SKILLS.언어} />
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('career')}</SectionTitle>
            <List>
              {CAREERS.map((career) => (
                <ListItem
                  key={career.company + career.period}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <span>
                    <strong>{career.company}</strong>
                    <span
                      style={{
                        color: '#a5b4fc',
                        fontWeight: 400,
                      }}
                    >
                      {' '}
                      ({career.position})
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.97em',
                      color: '#b3b8d4',
                      marginTop: 2,
                    }}
                  >
                    {career.period}
                  </span>
                </ListItem>
              ))}
            </List>
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('projects')}</SectionTitle>
            <List>
              {PROJECTS.map((project) => (
                <ListItem
                  key={project.name + project.period}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <span>
                    <strong>{project.name}</strong>
                    <span
                      style={{
                        color: '#a5b4fc',
                        fontWeight: 400,
                      }}
                    >
                      {' '}
                      ({project.client})
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.97em',
                      color: '#b3b8d4',
                      marginTop: 2,
                    }}
                  >
                    {project.role}
                  </span>
                  <span
                    style={{
                      fontSize: '0.95em',
                      color: '#8e95b6',
                      marginTop: 1,
                    }}
                  >
                    {project.period}
                  </span>
                </ListItem>
              ))}
            </List>
          </SimpleListCard>
        </SectionBlock>
      </AppContainer>
    </MainContainer>
  );
};

export default About;
