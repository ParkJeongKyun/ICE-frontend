'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  PreviewBox,
  SectionTitle,
  FaqBox,
  ListText,
  TopBox,
  GitHubBox,
} from './Home.styles';
import SponsorButton from '@/components/SponsorButton/SponsorButton';
import ReportButton from '@/components/ReportButton/ReportButton';
import GitHubFilledIcon from '../common/Icons/GitHubFilledIcon';

const PreviewFaqUseCases: React.FC = () => {
  const t = useTranslations();

  const faqData = t.raw('faq') as { q: string; a: string }[];
  const useCasesData = t.raw('useCases') as string[];

  return (
    <>
      <TopBox>
        <GitHubBox>
          <GitHubFilledIcon width={18} height={18} className="github-logo" />
          <div className="divider" />
          <SponsorButton />
          <div className="divider" />
          <ReportButton />
        </GitHubBox>
        <PreviewBox>
          <img
            src="/images/sample/sample.png"
            alt="ICE-PNG Forensic Interface Preview"
          />
        </PreviewBox>
      </TopBox>

      <section>
        <SectionTitle>{t('faqTab')}</SectionTitle>
        {faqData.map((item, index) => (
          <FaqBox key={index}>
            <h3 className="q">Q. {item.q}</h3>
            <p className="a">{item.a}</p>
          </FaqBox>
        ))}
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <SectionTitle>{t('useCasesTab')}</SectionTitle>
        {useCasesData.map((text, index) => (
          <ListText key={index}>• {text}</ListText>
        ))}
      </section>
    </>
  );
};

export default PreviewFaqUseCases;
