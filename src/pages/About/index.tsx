import React, { useState, useEffect, useRef } from 'react';
import {
  AnimatedHeading,
  AppContainer,
  MainContainer,
  Section,
  ImageContainer,
  MasonryItem,
  FeatureCard,
  ScrollIndicator,
  HeroSection,
  GlassCard,
  ProfileImage,
  BadgeImage,
  GradientText,
  SkillTag,
  SkillGrid,
  TimelineContainer,
  TimelineItem,
  TimelineDot,
  TimelineLine,
  TimelineContent,
  StatCard,
  StatsGrid,
  FloatingCard,
  SectionTitle,
  FeaturesGrid,
  InfoGrid,
  InfoCard,
  CertificateGrid,
  CertificateCard,
  ProjectCard,
  ProjectsGrid,
} from './index.styles';
import DownArrowIcon from '@/components/common/Icons/DownArrowIcon';
import { calculateExperience } from '@/utils/exifParser';
import Lanyard from '@/components/common/Lanyard/Lanyard';

const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible] as const;
};

const AnimatedSection: React.FC<{
  children: React.ReactNode;
  bgColor?: string;
}> = ({ children, bgColor }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });
  return (
    <Section
      ref={ref}
      $bgColor={bgColor}
      className={isVisible ? 'visible' : ''}
    >
      {children}
    </Section>
  );
};

const AnimatedItem: React.FC<{
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
}> = ({ children, delay = 0, threshold = 0.5 }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold });

  return React.cloneElement(children as React.ReactElement, {
    ref,
    $delay: delay,
    className: isVisible ? 'visible' : '',
  });
};

const About: React.FC = () => {
  const currentAge = new Date().getFullYear() - 2001;

  const personalInfo = [
    {
      icon: '🎂',
      label: '출생',
      value: `2001년 2월 23일 (만 ${currentAge}세)`,
    },
    { icon: '📍', label: '출생지', value: '대구광역시 중구 대봉동' },
    { icon: '🏠', label: '거주지', value: '서울특별시 강서구 화곡동' },
    { icon: '📧', label: '이메일', value: 'dbzoseh84@gmail.com' },
  ];

  const education = [
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

  const military = {
    service: '대한민국 해군 3함대사령부',
    position: 'CERT 정보보호병 (병장 전역)',
    period: '2020.11.23 ~ 2022.07.22',
    duration: calculateExperience(new Date('2020-11'), new Date('2022-07')),
  };

  const features = [
    {
      title: 'Digital Forensics',
      image: '/images/digital_forensics.jpg',
      description: '디지털 증거 분석 및 포렌식 조사',
      icon: '🔍',
    },
    {
      title: 'Security',
      image: '/images/security.jpg',
      description: '정보보안 및 사이버 보안',
      icon: '🛡️',
    },
    {
      title: 'Developer',
      image: '/images/developer.jpg',
      description: '풀스택 웹 개발 및 AI 플랫폼',
      icon: '💻',
    },
  ];

  const certificates = [
    { name: '디지털포렌식전문가 2급', icon: '🔍' },
    { name: '정보보안기사', icon: '🛡️' },
    { name: '정보보안산업기사', icon: '🔒' },
    { name: '정보처리산업기사', icon: '💻' },
    { name: '리눅스마스터 2급', icon: '🐧' },
    { name: '네트워크관리사 2급', icon: '🌐' },
  ];

  const skills = {
    languages: ['Python', 'TypeScript', 'JavaScript', 'Go', 'Java', 'HTML/CSS'],
    frameworks: ['React', 'Next.js', 'FastAPI', 'JSP'],
    tools: [
      'Docker',
      'Kubernetes',
      'Nifi',
      'Jupyter',
      'Kafka',
      'Redis',
      'Superset',
    ],
    expertise: ['Digital Forensics', 'Network Security', 'System Security'],
  };

  const careers = [
    {
      period: '2024.07 - Present',
      company: 'Aimos(주)',
      position: 'AI 플랫폼 개발팀 프리랜서 개발자',
      description: 'SI, SM, UI/UX, 웹, 파이썬, Java 개발',
      duration: calculateExperience(new Date('2024-07'), new Date()),
    },
    {
      period: '2022.07 - 2024.06',
      company: 'NuriggumSoft(주)',
      position: 'DX 개발팀',
      description: 'SI, UI/UX, 웹, 파이썬 개발',
      duration: calculateExperience(new Date('2022-07'), new Date('2024-06')),
    },
    {
      period: '2021.01 - 2022.07',
      company: '대한민국 해군 3함대사령부',
      position: 'CERT 사이버보안관제',
      description: '사이버보안 관제 및 정보보호',
      duration: calculateExperience(new Date('2021-01'), new Date('2022-07')),
    },
  ];

  const projects = [
    {
      name: '철 스크랩 Aimos 운영시스템',
      client: '대한제강, LG CNS, Aimos',
      role: 'TypeScript React 웹 프론트엔드 개발 및 운영',
      period: '2023.06 - 현재',
      duration: calculateExperience(new Date('2023-06'), new Date()),
      tags: ['React', 'TypeScript', 'SM'],
    },
    {
      name: '현대제철 야드비상조업',
      client: '현대제철, 현대ITC',
      role: 'Java, JavaScript JSP 웹 개발',
      period: '2023.06 - 2023.12',
      duration: calculateExperience(new Date('2023-06'), new Date('2023-12')),
      tags: ['JSP', 'Java', 'JavaScript'],
    },
    {
      name: '현대 ITC 안전 보건 시스템',
      client: '현대ITC',
      role: 'TypeScript React 웹 프론트엔드 개발',
      period: '2023.03 - 2023.06',
      duration: calculateExperience(new Date('2023-03'), new Date('2023-06')),
      tags: ['React', 'TypeScript'],
    },
    {
      name: '차세대 지방 재정 분석 시스템',
      client: '한국지역정보개발원',
      role: 'Jupyter Hub AI 분석 환경, Nifi 데이터 ETL',
      period: '2023.01 - 2023.08',
      duration: calculateExperience(new Date('2023-01'), new Date('2023-08')),
      tags: ['Jupyter', 'Nifi', 'ETL'],
    },
    {
      name: 'AI Link On, Plant AI',
      client: 'LG 화학, LG CNS',
      role: 'Python Fast API 백엔드 개발',
      period: '2022.07 - 2022.12',
      duration: calculateExperience(new Date('2022-07'), new Date('2022-12')),
      tags: ['Python', 'FastAPI'],
    },
  ];

  const stats = [
    { label: '보유 자격증', value: '6+' },
    { label: '프로젝트 경험', value: '8+' },
    { label: '개발 경력', value: '3y+' },
    { label: '기술 스택', value: '20+' },
  ];

  return (
    <MainContainer>
      <AppContainer>
        {/* Temporarily comment out until card.glb is available */}
        <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />

        {/* Hero Section */}
        <HeroSection>
          <div className="hero-content">
            <GlassCard>
              <div className="profile-section">
                <ProfileImage>
                  <img src="/images/kyun.jpg" alt="Profile" />
                </ProfileImage>
                <BadgeImage>
                  <img src="/images/forensic_badge.png" alt="Badge" />
                </BadgeImage>
              </div>
              <GradientText>박정균</GradientText>
              <h3
                style={{
                  margin: '0.5rem 0',
                  fontWeight: '400',
                  fontSize: '1.2rem',
                }}
              >
                Park Jeong-kyun • 朴正均
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  opacity: 0.9,
                  margin: '1rem 0',
                  fontWeight: '500',
                }}
              >
                Digital Forensics • Security • Developer
              </p>
              <p
                style={{ fontSize: '0.95rem', opacity: 0.7, margin: '1rem 0' }}
              >
                디지털 포렌식 전문가이자 정보보안 전문가, 그리고 풀스택
                개발자입니다.
              </p>

              <StatsGrid>
                {stats.map((stat, index) => (
                  <StatCard key={index} $delay={index * 0.1}>
                    <div className="value">{stat.value}</div>
                    <div className="label">{stat.label}</div>
                  </StatCard>
                ))}
              </StatsGrid>
            </GlassCard>
          </div>

          <ScrollIndicator>
            <div className="text">Scroll to explore</div>
            <DownArrowIcon width={35} height={35} />
          </ScrollIndicator>
        </HeroSection>

        {/* Features Section */}
        <AnimatedSection bgColor={'var(--main-bg-color)'}>
          <div
            style={{ width: '100%', maxWidth: '1200px', padding: '4rem 2rem' }}
          >
            <SectionTitle>
              <h2>전문 분야</h2>
              <p>다양한 영역에서의 전문성을 보유하고 있습니다</p>
            </SectionTitle>

            <FeaturesGrid>
              {features.map((feature, index) => (
                <AnimatedItem key={index} delay={index * 0.2} threshold={0.3}>
                  <MasonryItem>
                    <FeatureCard>
                      <div className="icon">{feature.icon}</div>
                      <ImageContainer>
                        <img src={feature.image} alt={feature.title} />
                        <div className="overlay">
                          <p>{feature.description}</p>
                        </div>
                      </ImageContainer>
                      <AnimatedHeading>{feature.title}</AnimatedHeading>
                    </FeatureCard>
                  </MasonryItem>
                </AnimatedItem>
              ))}
            </FeaturesGrid>
          </div>
        </AnimatedSection>

        {/* Personal Info Section */}
        <AnimatedSection bgColor={'var(--main-hover-color)'}>
          <div
            style={{ width: '100%', maxWidth: '1200px', padding: '4rem 2rem' }}
          >
            <SectionTitle>
              <h2>인적 사항</h2>
              <p>기본 정보와 학력</p>
            </SectionTitle>

            <InfoGrid>
              {personalInfo.map((info, index) => (
                <AnimatedItem key={index} delay={index * 0.15}>
                  <InfoCard>
                    <div className="icon">{info.icon}</div>
                    <div className="content">
                      <div className="label">{info.label}</div>
                      <div className="value">{info.value}</div>
                    </div>
                  </InfoCard>
                </AnimatedItem>
              ))}
            </InfoGrid>

            <div style={{ marginTop: '3rem' }}>
              <h3
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                학력
              </h3>
              <InfoGrid>
                {education.map((edu, index) => (
                  <AnimatedItem key={index} delay={index * 0.15}>
                    <InfoCard>
                      <div className="icon">🎓</div>
                      <div className="content">
                        <div className="value">{edu.school}</div>
                        <div className="label">
                          {edu.major} {edu.status}
                        </div>
                        <div className="period">{edu.year}</div>
                      </div>
                    </InfoCard>
                  </AnimatedItem>
                ))}
              </InfoGrid>
            </div>

            <div style={{ marginTop: '3rem' }}>
              <h3
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                병역
              </h3>
              <FloatingCard
                $delay={0.3}
                style={{ maxWidth: '600px', margin: '0 auto' }}
              >
                <div
                  className="icon"
                  style={{ fontSize: '2rem', marginBottom: '1rem' }}
                >
                  ⚓
                </div>
                <h3>{military.service}</h3>
                <div className="position">{military.position}</div>
                <div className="period">{military.period}</div>
                <p>{military.duration}</p>
              </FloatingCard>
            </div>
          </div>
        </AnimatedSection>

        {/* Certificates Section */}
        <AnimatedSection bgColor={'var(--main-bg-color)'}>
          <div
            style={{ width: '100%', maxWidth: '1200px', padding: '4rem 2rem' }}
          >
            <SectionTitle>
              <h2>보유 자격증</h2>
              <p>전문성을 인정받은 자격증들</p>
            </SectionTitle>

            <CertificateGrid>
              {certificates.map((cert, index) => (
                <AnimatedItem key={index} delay={index * 0.1}>
                  <CertificateCard>
                    <div className="icon">{cert.icon}</div>
                    <div className="name">{cert.name}</div>
                  </CertificateCard>
                </AnimatedItem>
              ))}
            </CertificateGrid>
          </div>
        </AnimatedSection>

        {/* Skills Section */}
        <AnimatedSection bgColor={'var(--main-hover-color)'}>
          <div
            style={{ width: '100%', maxWidth: '1200px', padding: '4rem 2rem' }}
          >
            <SectionTitle>
              <h2>기술 스택</h2>
              <p>다양한 기술과 도구를 활용합니다</p>
            </SectionTitle>

            {Object.entries(skills).map(([category, items], catIndex) => (
              <div key={category} style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.3rem',
                    marginBottom: '1.2rem',
                    opacity: 0.9,
                    fontWeight: '600',
                  }}
                >
                  {category === 'languages' && '언어'}
                  {category === 'frameworks' && '프레임워크'}
                  {category === 'tools' && '도구 & 플랫폼'}
                  {category === 'expertise' && '전문 분야'}
                </h3>
                <SkillGrid>
                  {items.map((skill, index) => (
                    <AnimatedItem
                      key={index}
                      delay={catIndex * 0.5 + index * 0.05}
                    >
                      <SkillTag>{skill}</SkillTag>
                    </AnimatedItem>
                  ))}
                </SkillGrid>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Career Timeline Section */}
        <AnimatedSection bgColor={'var(--main-bg-color)'}>
          <div
            style={{ width: '100%', maxWidth: '900px', padding: '4rem 2rem' }}
          >
            <SectionTitle>
              <h2>업무 경력</h2>
              <p>전문적인 경험과 성장의 여정</p>
            </SectionTitle>

            <TimelineContainer>
              {careers.map((career, index) => (
                <AnimatedItem key={index} delay={index * 0.25}>
                  <TimelineItem>
                    <TimelineDot />
                    {index < careers.length - 1 && <TimelineLine />}
                    <TimelineContent>
                      <FloatingCard $delay={index * 0.25}>
                        <div className="period">{career.period}</div>
                        <h3>{career.company}</h3>
                        <div className="position">{career.position}</div>
                        <p>{career.description}</p>
                        <div className="duration">{career.duration}</div>
                      </FloatingCard>
                    </TimelineContent>
                  </TimelineItem>
                </AnimatedItem>
              ))}
            </TimelineContainer>
          </div>
        </AnimatedSection>

        {/* Projects Section */}
        <AnimatedSection bgColor={'var(--main-hover-color)'}>
          <div
            style={{ width: '100%', maxWidth: '1200px', padding: '4rem 2rem' }}
          >
            <SectionTitle>
              <h2>프로젝트 경력</h2>
              <p>참여한 주요 프로젝트들</p>
            </SectionTitle>

            <ProjectsGrid>
              {projects.map((project, index) => (
                <AnimatedItem key={index} delay={index * 0.15} threshold={0.3}>
                  <ProjectCard>
                    <h3>{project.name}</h3>
                    <div className="client">고객사: {project.client}</div>
                    <div className="role">{project.role}</div>
                    <div className="period">
                      {project.period} ({project.duration})
                    </div>
                    <div className="tags">
                      {project.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </ProjectCard>
                </AnimatedItem>
              ))}
            </ProjectsGrid>
          </div>
        </AnimatedSection>
      </AppContainer>
    </MainContainer>
  );
};

export default About;
