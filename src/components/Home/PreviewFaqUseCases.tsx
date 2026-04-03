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
import ForensicInterviewCard from '@/layouts/AboutLayout/ForensicInterviewCard/ForensicInterviewCard';

const PreviewFaqUseCases: React.FC = () => {
  const t = useTranslations();
  const tAbout = useTranslations('about');

  const faqData = t.raw('faq') as { q: string; a: string }[];
  const useCasesData = t.raw('useCases') as string[];

  return (
    <>
      <TopBox>
        <PreviewBox>
          <img
            src="/images/sample/sample.webp"
            alt="ICE-PNG Forensic Interface Preview"
            width={500}
            height={234}
            fetchPriority="high"
          />
        </PreviewBox>
        <GitHubBox>
          <SponsorButton />
          <div className="divider" />
          <ReportButton />
        </GitHubBox>
      </TopBox>

      <section>
        <SectionTitle>{tAbout('featuredInterview')}</SectionTitle>
        <ForensicInterviewCard
          title={tAbout('interviewCardTitle')}
          date={tAbout('interviewCardDate')}
          description={tAbout('interviewCardDescription')}
          imageAlt={tAbout('interviewCardImageAlt')}
          readMoreText={tAbout('interviewCardReadMore')}
          sourceLabel={tAbout('interviewCardSourceLabel')}
          sourceName={tAbout('interviewCardSourceName')}
          sourceIconAlt={tAbout('interviewCardSourceIconAlt')}
        />
      </section>

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
