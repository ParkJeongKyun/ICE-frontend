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
  SponsorNote,
  SponsorNoteSub,
  LangSwitcherCorner,
} from './AboutLayout.styles';
import Lanyard from './Lanyard/Lanyard';
import SponsorButton from '@/components/SponsorButton/SponsorButton';
import LocaleSwitcher from '@/components/LocaleSwitcher/LocaleSwitcher';

const CURRENT_AGE = new Date().getFullYear() - 2001;

type EducationItem = {
  school: string;
  major: string;
  status: string;
  year: string;
};
type MilitaryData = { service: string; position: string; period: string };
type CareerItem = { period: string; company: string; position: string };
type ProjectItem = {
  name: string;
  client: string;
  role: string;
  period: string;
};

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
            background: 'var(--main-hover-color)',
            color: 'var(--ice-main-color)',
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

  const education = t.raw('educationData') as EducationItem[];
  const military = t.raw('militaryData') as MilitaryData;
  const certificates = t.raw('certificatesData') as string[];
  const skillsExpert = t.raw('skillsExpertData') as string[];
  const skillsLang = t.raw('skillsLangData') as string[];
  const careers = t.raw('careersData') as CareerItem[];
  const projects = t.raw('projectsData') as ProjectItem[];

  return (
    <MainContainer>
      <HeroSection>
        <AnimatedBg />
        <LangSwitcherCorner>
          <LocaleSwitcher />
        </LangSwitcherCorner>
        <Lanyard />
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
                <strong>{t('name')}</strong> {t('nameValue')}
              </ListItem>
              <ListItem>
                <strong>{t('dateOfBirth')}</strong> {t('dateOfBirthValue')}{' '}
                <span
                  style={{
                    color: 'var(--ice-main-color)',
                    marginLeft: 8,
                  }}
                >
                  ({CURRENT_AGE}
                  {t('age')})
                </span>
              </ListItem>
              <ListItem>
                <strong>{t('email')}</strong>{' '}
                <a
                  href="mailto:dbzoseh84@gmail.com"
                  style={{
                    color: 'var(--ice-main-color)',
                    textDecoration: 'underline',
                  }}
                >
                  dbzoseh84@gmail.com
                </a>
              </ListItem>
              <ListItem>
                <strong>{t('residence')}</strong> {t('residenceValue')}
              </ListItem>
              <ListItem>
                <strong>{t('birthplace')}</strong> {t('birthplaceValue')}
              </ListItem>
            </List>
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('certificates')}</SectionTitle>
            <TagList items={certificates} />
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('education')}</SectionTitle>
            <List>
              {education.map((edu) => (
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
                          color: 'var(--ice-main-color)',
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
                      color: 'var(--main-color-reverse)',
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
                  <strong>{military.service}</strong>
                  <span
                    style={{
                      color: 'var(--ice-main-color)',
                      fontWeight: 400,
                    }}
                  >
                    {' '}
                    ({military.position})
                  </span>
                </span>
                <span
                  style={{
                    fontSize: '0.97em',
                    color: 'var(--main-color-reverse)',
                    marginTop: 2,
                  }}
                >
                  {military.period}
                </span>
              </ListItem>
            </List>
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('expertise')}</SectionTitle>
            <TagList items={skillsExpert} />
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('languages')}</SectionTitle>
            <TagList items={skillsLang} />
          </SimpleListCard>
        </SectionBlock>
        <SectionBlock>
          <SimpleListCard>
            <SectionTitle>{t('career')}</SectionTitle>
            <List>
              {careers.map((career) => (
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
                        color: 'var(--ice-main-color)',
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
                      color: 'var(--main-color-reverse)',
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
              {projects.map((project) => (
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
                        color: 'var(--ice-main-color)',
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
                      color: 'var(--main-color-reverse)',
                      marginTop: 2,
                    }}
                  >
                    {project.role}
                  </span>
                  <span
                    style={{
                      fontSize: '0.95em',
                      color: 'var(--main-color-reverse)',
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
        <SectionBlock>
          <SimpleListCard>
            <SponsorNote>
              {t('sponsorNote')}
              <SponsorNoteSub>{t('sponsorSub')}</SponsorNoteSub>
            </SponsorNote>
            <SponsorButton />
          </SimpleListCard>
        </SectionBlock>
      </AppContainer>
    </MainContainer>
  );
};

export default About;
