'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { Link } from '@/locales/routing';
import {
  Container,
  Card,
  Copyright,
  LogoContainer,
  ContentWrapper,
  Sidebar,
  NavItem,
  MainContent,
  Section,
  SectionTitle,
  SectionContent,
  LastUpdated,
  Title,
  ImportantBox,
  ListItem,
} from './PrivacyLayout.styles';
import Logo from '@/components/common/Icons/Logo/Logo';
import LocaleSwitcher from '@/components/LocaleSwitcher/LocaleSwitcher';

const PrivacyLayout: React.FC = () => {
  const t = useTranslations('privacy');
  const messages = useMessages() as any;
  const sections = messages.privacy.sections;

  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');
  const mainContentRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebarElement = document.querySelector('aside');
    
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      const rootElement = isMobile ? contentWrapperRef.current : mainContentRef.current;
      
      // 모바일 -> PC 전환 시 사이드바 및 컨테이너 스크롤 초기화 (짤림 방지)
      if (!isMobile) {
        if (sidebarElement) sidebarElement.scrollTop = 0;
        if (contentWrapperRef.current) contentWrapperRef.current.scrollTop = 0;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const rootElement = window.innerWidth < 1024 ? contentWrapperRef.current : mainContentRef.current;
    if (!rootElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootElement;
      
      // 하단 도달 시 마지막 섹션 활성화
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }

      const sectionElements = Array.from(document.querySelectorAll('section[id]'));
      const containerRect = rootElement.getBoundingClientRect();
      
      // 모바일과 PC에서 시각적으로 적절한 기준선 설정
      // 모바일(1024px 미만)에서는 상단 사이드바 영역을 고려하여 약간 더 아래를 기준으로 함
      const isMobile = window.innerWidth < 1024;
      const targetLine = containerRect.top + (isMobile ? clientHeight * 0.15 : clientHeight * 0.25);

      let foundId = sections[0].id;
      for (const el of sectionElements) {
        if (el.getBoundingClientRect().top <= targetLine) {
          foundId = el.id;
        } else {
          break;
        }
      }
      setActiveId(foundId);
    };

    rootElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => rootElement.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    const container = window.innerWidth < 1024 ? contentWrapperRef.current : mainContentRef.current;

    if (element && container) {
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollTarget = elementTop - containerTop + container.scrollTop;

      container.scrollTo({
        top: scrollTarget,
        behavior: 'smooth',
      });
    }
  }, []);

  const renderTextWithBreaks = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderSectionContent = (section: any) => {
    return (
      <SectionContent>
        {section.content && <p>{renderTextWithBreaks(section.content)}</p>}

        {section.items && (
          <ul>
            {section.items.map((item: string, idx: number) => (
              <ListItem key={idx}>{item}</ListItem>
            ))}
          </ul>
        )}

        {section.list && (
          <ul>
            {section.list.map((item: any, idx: number) => (
              <ListItem key={idx}>
                {item.bold && <strong>{item.bold}</strong>}
                {item.text && (
                  <>
                    {item.link ? (
                      <a
                        href={item.link}
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </>
                )}
                {item.subList && (
                  <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
                    {item.subList.map((sub: any, sIdx: number) => (
                      <li
                        key={sIdx}
                        style={{ marginBottom: '0.75rem', paddingLeft: '1rem' }}
                      >
                        {sub.bold && <strong>{sub.bold}</strong>}
                        {sub.text}
                      </li>
                    ))}
                  </ul>
                )}
              </ListItem>
            ))}
          </ul>
        )}

        {section.important && (
          <ImportantBox>
            {section.important.prefix && (
              <span style={{ color: 'var(--main-color-reverse)' }}>
                {section.important.prefix}
              </span>
            )}
            {section.important.text && (
              <strong style={{ marginLeft: '0.25rem' }}>
                {section.important.text}
              </strong>
            )}
          </ImportantBox>
        )}

        {section.footer && (
          <div style={{ marginTop: '1.5rem' }}>
            {section.footer.bold && <strong>{section.footer.bold}</strong>}
            {section.footer.text}
          </div>
        )}
      </SectionContent>
    );
  };

  return (
    <Container as="main">
      <Card>
        <LogoContainer>
          <Link href="/" aria-label="Home">
            <Logo showText size={38} textSize={38} />
          </Link>
          <LocaleSwitcher />
        </LogoContainer>

        <ContentWrapper ref={contentWrapperRef}>
          <Sidebar>
            <Title>{t('title')}</Title>
            <LastUpdated>{t('lastUpdated')}</LastUpdated>
            <nav>
              {sections.map((section: any) => (
                <NavItem
                  key={section.id}
                  $active={activeId === section.id}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.title}
                </NavItem>
              ))}
            </nav>
          </Sidebar>

          <MainContent ref={mainContentRef}>
            {sections.map((section: any) => (
              <Section key={section.id} id={section.id}>
                <SectionTitle>{section.title}</SectionTitle>
                {renderSectionContent(section)}
              </Section>
            ))}
            <Copyright>{messages.copyright || '© ICE Forensic'}</Copyright>
          </MainContent>
        </ContentWrapper>
      </Card>
    </Container>
  );
};

export default PrivacyLayout;
