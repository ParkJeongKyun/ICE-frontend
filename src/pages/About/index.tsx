import React from 'react';
import {
  AppContainer,
  MainContainer,
  SectionCard,
  SectionTitle,
  List,
  ListItem,
  SubTitle,
  ScrollIndicator,
} from './index.styles';
import Lanyard from '@/pages/About/Lanyard';

// 데이터 상수화
const CURRENT_AGE = new Date().getFullYear() - 2001;

const PERSONAL_INFO = [
  { label: '출생', value: `2001년 2월 23일 (만 ${CURRENT_AGE}세)` },
  { label: '출생지', value: '대구광역시 중구' },
  { label: '거주지', value: '서울특별시 강서구' },
  { label: '이메일', value: 'dbzoseh84@gmail.com' },
];

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
  { school: '협성고등학교', major: '', status: '졸업', year: '2019' },
];

const MILITARY = {
  service: '대한민국 해군 3함대사령부',
  position: 'CERT 정보보호병 (병장 전역)',
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
  프레임워크: ['React', 'Next.js', 'FastAPI', 'JSP'],
  도구: [
    'Docker',
    'Kubernetes',
    'Nifi',
    'Jupyter',
    'Kafka',
    'Redis',
    'Superset',
  ],
  전문분야: ['Digital Forensics', 'Network Security', 'System Security'],
};

const CAREERS = [
  {
    period: '2024.07 - Present',
    company: 'Aimos(주)',
    position: 'AI 플랫폼 개발팀 프리랜서 개발자',
  },
  {
    period: '2022.07 - 2024.06',
    company: 'NuriggumSoft(주)',
    position: 'DX 개발팀',
  },
  {
    period: '2021.01 - 2022.07',
    company: '대한민국 해군 3함대사령부',
    position: 'CERT 사이버보안관제',
  },
];

const PROJECTS = [
  {
    name: '철 스크랩 Aimos 운영시스템',
    client: '대한제강, LG CNS, Aimos',
    role: 'TypeScript React 웹 프론트엔드 개발 및 운영',
    period: '2023.06 - 현재',
  },
  {
    name: '현대제철 야드비상조업',
    client: '현대제철, 현대ITC',
    role: 'Java, JavaScript JSP 웹 개발',
    period: '2023.06 - 2023.12',
  },
  {
    name: '현대 ITC 안전 보건 시스템',
    client: '현대ITC',
    role: 'TypeScript React 웹 프론트엔드 개발',
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
    role: 'Python Fast API 백엔드 개발',
    period: '2022.07 - 2022.12',
  },
];

// SectionCard 렌더링 함수
function renderListSection(title: string, items: string[] | React.ReactNode[]) {
  return (
    <SectionCard>
      <SectionTitle>{title}</SectionTitle>
      <List>
        {items.map((item, idx) => (
          <ListItem key={idx}>{item}</ListItem>
        ))}
      </List>
    </SectionCard>
  );
}

const About: React.FC = () => (
  <MainContainer>
    <AppContainer>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background:
            'linear-gradient(135deg, var(--main-bg-color) 0%, var(--main-hover-color) 100%)',
        }}
      >
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
      </div>

      <SectionCard>
        <SectionTitle>인적사항</SectionTitle>
        <List>
          {PERSONAL_INFO.map((info, idx) => (
            <ListItem key={idx}>
              <strong>{info.label}:</strong> {info.value}
            </ListItem>
          ))}
        </List>
        <SubTitle>학력</SubTitle>
        <List>
          {EDUCATION.map((edu, idx) => (
            <ListItem key={idx}>
              <strong>{edu.school}</strong>({edu.major && `${edu.major}, `}
              {edu.status}, {edu.year})
            </ListItem>
          ))}
        </List>
        <SubTitle>병역</SubTitle>
        <List>
          <ListItem>
            <strong>{MILITARY.service}</strong>({MILITARY.position},{' '}
            {MILITARY.period})
          </ListItem>
        </List>
      </SectionCard>

      {renderListSection('보유 자격증', CERTIFICATES)}

      <SectionCard>
        <SectionTitle>기술 스택</SectionTitle>
        {Object.entries(SKILLS).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '0.7rem' }}>
            <SubTitle>{category}</SubTitle>
            <List>
              {items.map((skill, idx) => (
                <ListItem key={idx}>{skill}</ListItem>
              ))}
            </List>
          </div>
        ))}
      </SectionCard>

      <SectionCard>
        <SectionTitle>업무 경력</SectionTitle>
        <List>
          {CAREERS.map((career, idx) => (
            <ListItem key={idx}>
              <strong>{career.company}</strong>({career.position},{' '}
              {career.period})
            </ListItem>
          ))}
        </List>
      </SectionCard>

      <SectionCard>
        <SectionTitle>프로젝트 경력</SectionTitle>
        <List>
          {PROJECTS.map((project, idx) => (
            <ListItem key={idx}>
              <strong>{project.name}</strong> ({project.client}, {project.role},{' '}
              {project.period})
            </ListItem>
          ))}
        </List>
      </SectionCard>
    </AppContainer>
  </MainContainer>
);

export default About;
