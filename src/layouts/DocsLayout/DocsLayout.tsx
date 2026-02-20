'use client';

import React from 'react';
import { Container, Card, Copyright, LogoContainer } from './DocsLayout.styles';
import PreviewFaqUseCases from '@/components/Home/PreviewFaqUseCases';
import { useTranslations } from 'next-intl';
import Link from 'next/dist/client/link';
import Logo from '@/components/common/Icons/Logo/Logo';

const DocsLayout: React.FC = () => {
  const t = useTranslations();
  return (
    <Container>
      <Card>
        <LogoContainer>
          <Link href="/" aria-label={t('home.homepage')}>
            <Logo showText size={38} textSize={38} />
          </Link>
        </LogoContainer>
        <PreviewFaqUseCases />
        <Copyright>{t('copyright')}</Copyright>
      </Card>
    </Container>
  );
};

export default DocsLayout;
