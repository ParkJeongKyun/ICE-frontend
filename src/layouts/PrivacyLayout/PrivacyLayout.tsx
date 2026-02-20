'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/locales/routing';
import ICEMarkDown from '@/components/markdown';
import {
  Container,
  Copyright,
  LogoContainer,
  MarkdownBox,
} from './PrivacyLayout.styles';
import Logo from '@/components/common/Icons/Logo/Logo';

interface PrivacyLayoutProps {
  initialContent: string;
}

const PrivacyLayout: React.FC<PrivacyLayoutProps> = ({ initialContent }) => {
  const t = useTranslations();

  return (
    <Container>
      <MarkdownBox>
        <LogoContainer>
          <Link href="/" aria-label={t('home.homepage')}>
            <Logo showText size={38} textSize={38} />
          </Link>
        </LogoContainer>
        <ICEMarkDown defaultText={initialContent} key={'privacyPolicy'} />
        <Copyright>{t('copyright')}</Copyright>
      </MarkdownBox>
    </Container>
  );
};

export default PrivacyLayout;
