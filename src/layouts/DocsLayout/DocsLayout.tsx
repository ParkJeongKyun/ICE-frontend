'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  Copyright,
  LogoContainer,
  TabBar,
  TabButton,
  TabContents,
  TabContent,
  IntroContainer,
} from './DocsLayout.styles';
import PreviewFaqUseCases from '@/components/Home/PreviewFaqUseCases';
import { useTranslations } from 'next-intl';
import { Link } from '@/locales/routing';
import Logo from '@/components/common/Icons/Logo/Logo';
import ICEMarkDown from '@/components/markdown';

interface DocsLayoutProps {
  markdownData?: { [key: string]: string };
}

const DocsLayout: React.FC<DocsLayoutProps> = ({ markdownData = {} }) => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<string>('intro');

  const tabs = [
    { key: 'intro', label: t('docs.intro') },
    { key: 'about', label: t('docs.about') },
    { key: 'howToUse', label: t('docs.howToUse') },
    { key: 'release', label: t('docs.release') },
  ];

  return (
    <Container>
      <Card>
        <LogoContainer>
          <Link href="/" aria-label={t('home.homepage')}>
            <Logo showText size={38} textSize={38} />
          </Link>
        </LogoContainer>
        <TabBar>
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              $active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabBar>
        <TabContents>
          <TabContent $active={activeTab === 'intro'}>
            <IntroContainer>
              <PreviewFaqUseCases />
            </IntroContainer>
          </TabContent>
          <TabContent $active={activeTab === 'about'}>
            <ICEMarkDown
              defaultText={markdownData.about || ''}
              showBackButton={false}
              onTabChange={setActiveTab}
            />
          </TabContent>
          <TabContent $active={activeTab === 'release'}>
            <ICEMarkDown
              defaultText={markdownData.release || ''}
              showBackButton={false}
              onTabChange={setActiveTab}
            />
          </TabContent>
          <TabContent $active={activeTab === 'howToUse'}>
            <ICEMarkDown
              defaultText={markdownData.howToUse || ''}
              showBackButton={false}
              onTabChange={setActiveTab}
            />
          </TabContent>
        </TabContents>
        <Copyright>{t('copyright')}</Copyright>
      </Card>
    </Container>
  );
};

export default DocsLayout;
