'use client';

import React from 'react';
import styled from 'styled-components';

type ForensicInterviewCardProps = {
  title: string;
  date: string;
  description: string;
  imageAlt: string;
  readMoreText: string;
  sourceLabel?: string;
  sourceName?: string;
  sourceIconAlt?: string;
  link?: string;
  imageSrc?: string;
  sourceIconSrc?: string;
};

const CardWrapper = styled.article`
  width: 100%;
  max-width: 500px;
`;

const CardLink = styled.a`
  display: block;
  background: var(--main-bg-color);
  border: 1px solid var(--main-line-color);
  border-radius: 6px;
  box-shadow: none;
  padding: 1.5rem;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--ice-main-color);
  }

  &:focus-visible {
    outline: 2px solid var(--ice-main-color);
    outline-offset: 3px;
  }
`;

const InterviewHeader = styled.header`
  margin-bottom: 0.7rem;
`;

const InterviewTitle = styled.h3`
  margin: 0 0 0.45rem;
  color: var(--ice-main-color);
  font-size: 1.36rem;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -0.01em;
`;

const SourceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.95rem;
  padding: 0.34rem 0.62rem;
  border-radius: 6px;
  border: 1px solid var(--main-line-color);
  background: var(--main-bg-color);
`;

const SourceIcon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const SourceText = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--main-color-reverse);
  letter-spacing: 0.01em;
`;

const SourceName = styled.span`
  color: var(--ice-main-color);
`;

const InterviewDate = styled.time`
  display: block;
  margin: 0 0 1rem;
  color: var(--main-color-reverse);
  font-style: italic;
  font-size: 0.92rem;
`;

const InterviewImage = styled.img`
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 6px;
  border: 1px solid var(--main-line-color);
  object-fit: cover;
  margin-bottom: 1.25rem;
`;

const InterviewSummary = styled.p`
  margin: 0;
  color: var(--main-color);
  font-size: 1rem;
  line-height: 1.62;
  font-weight: 350;
`;

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.95rem;
  color: var(--ice-main-color);
  font-size: 0.9rem;
  font-weight: 700;
`;

const ForensicInterviewCard: React.FC<ForensicInterviewCardProps> = ({
  title,
  date,
  description,
  imageAlt,
  readMoreText,
  sourceLabel = 'Interviewed at',
  sourceName = 'Forensic Focus',
  sourceIconAlt = 'Forensic Focus icon',
  link = 'https://www.forensicfocus.com/interviews/jeongkyun-park-information-security-student-and-independent-developer-korea-cyber-university/',
  imageSrc = '/images/articles/article_1.webp',
  sourceIconSrc = 'https://www.google.com/s2/favicons?domain=forensicfocus.com&sz=64',
}) => {
  // Use a fixed ISO date for SEO (should match the real article date)
  const isoDate = '2026-03-17T00:00:00+09:00';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    datePublished: isoDate,
    author: {
      '@type': 'Person',
      name: 'JeongKyun Park',
    },
    publisher: {
      '@type': 'Organization',
      name: sourceName,
      url: 'https://www.forensicfocus.com',
    },
    mainEntityOfPage: link,
    image: imageSrc,
    description: description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CardWrapper>
        <CardLink href={link} target="_blank" rel="noopener noreferrer">
          <SourceBadge>
            <SourceIcon
              src={sourceIconSrc}
              alt={sourceIconAlt}
              loading="lazy"
            />
            <SourceText>
              {sourceLabel} <SourceName>{sourceName}</SourceName>
            </SourceText>
          </SourceBadge>
          <InterviewHeader>
            <InterviewTitle>{title}</InterviewTitle>
            <InterviewDate dateTime={isoDate}>{date}</InterviewDate>
          </InterviewHeader>
          <InterviewImage
            src={imageSrc}
            alt={
              imageAlt ||
              'Digital Forensics Interview with JeongKyun Park on Forensic Focus'
            }
            loading="lazy"
            width={500}
            height={248}
          />
          <InterviewSummary>{description}</InterviewSummary>
          <ReadMore>
            {readMoreText} <span aria-hidden="true">→</span>
          </ReadMore>
        </CardLink>
      </CardWrapper>
    </>
  );
};

export default ForensicInterviewCard;
