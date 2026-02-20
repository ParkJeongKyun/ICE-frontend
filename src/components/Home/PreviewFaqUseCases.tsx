'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PreviewBox, SectionTitle, FaqBox, ListText } from './Home.styles';

const PreviewFaqUseCases: React.FC = () => {
  const t = useTranslations();

  const faqData = t.raw('faq') as { q: string; a: string }[];
  const useCasesData = t.raw('useCases') as string[];

  return (
    <>
      <PreviewBox>
        <img
          src="/images/sample/sample.png"
          alt="ICE-PNG Forensic Interface Preview"
        />
      </PreviewBox>

      <section>
        <SectionTitle>{t('faqTab')}</SectionTitle>
        {faqData.map((item, index) => (
          <FaqBox key={index}>
            <h3 className="q">Q. {item.q}</h3>
            <p className="a">{item.a}</p>
          </FaqBox>
        ))}
      </section>

      <section style={{ marginBottom: '5rem' }}>
        <SectionTitle>{t('useCasesTab')}</SectionTitle>
        {useCasesData.map((text, index) => (
          <ListText key={index}>• {text}</ListText>
        ))}
      </section>
    </>
  );
};

export default PreviewFaqUseCases;
