'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import ICEMarkDown from '@/components/markdown';
import { Container, MarkdownBox } from './PrivacyLayout.styles';

const PrivacyLayout: React.FC = () => {
  const locale = useLocale();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await fetch(`/locales/${locale}/markdown/privacy.md`);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Failed to load privacy policy:', error);
      }
    };

    fetchPrivacyPolicy();
  }, [locale]);

  return (
    <Container>
      <MarkdownBox>
        <ICEMarkDown defaultText={content} key={'privacyPolicy'} />
      </MarkdownBox>
    </Container>
  );
};

export default PrivacyLayout;
