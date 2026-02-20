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
  IntroContainer,
} from './DocsLayout.styles';
import PreviewFaqUseCases from '@/components/Home/PreviewFaqUseCases';
import { useTranslations } from 'next-intl';
import Link from 'next/dist/client/link';
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
    { key: 'update', label: t('docs.update') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'intro':
        return (
          <IntroContainer>
            <PreviewFaqUseCases />
          </IntroContainer>
        );
      case 'about':
        return <ICEMarkDown defaultText={markdownData.about || ''} />;
      case 'release':
        return <ICEMarkDown defaultText={markdownData.release || ''} />;
      case 'update':
        return <ICEMarkDown defaultText={markdownData.update || ''} />;
      case 'howToUse':
        return <ICEMarkDown defaultText={markdownData.howToUse || ''} />;
      default:
        return null;
    }
  };

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
        <TabContents>{renderContent()}</TabContents>
        <Copyright>{t('copyright')}</Copyright>
      </Card>
    </Container>
  );
};

export default DocsLayout;
