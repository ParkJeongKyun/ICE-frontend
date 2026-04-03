'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import IssueIcon from '../common/Icons/IssueIcon';

const ReportLink = styled.a`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  color: var(--ice-main-color);
  background: transparent;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    background: rgba(96, 200, 255, 0.1);
    border-color: rgba(96, 200, 255, 0.3);

    svg {
      transform: scale(1.15);
      filter: drop-shadow(0 0 4px rgba(96, 200, 255, 0.5));
    }
  }

  &:active {
    transform: scale(0.97);
  }
`;

export default function ReportButton() {
  const t = useTranslations('report');

  return (
    <ReportLink
      href={process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={t('description')}
      aria-label={t('ariaLabel')}
    >
      <IssueIcon width={14} height={14} color="var(--ice-main-color)" />
      <span>{t('button')}</span>
      <small
        style={{
          fontSize: '0.6875rem',
          fontWeight: 400,
        }}
      >
        {t('description')}
      </small>
    </ReportLink>
  );
}
