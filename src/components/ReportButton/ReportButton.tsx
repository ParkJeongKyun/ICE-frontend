'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';

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

const IssueIcon = styled.svg`
  fill: var(--ice-main-color);
  transition: all 0.3s ease;
  flex-shrink: 0;
`;

export default function ReportButton() {
  const t = useTranslations('report');
  const GITHUB_REPO = 'ParkJeongKyun/ICE-frontend';

  return (
    <ReportLink
      href={`https://github.com/${GITHUB_REPO}/issues`}
      target="_blank"
      rel="noopener noreferrer"
      title={t('description')}
      aria-label={t('ariaLabel')}
    >
      <IssueIcon
        aria-hidden="true"
        height="14"
        viewBox="0 0 16 16"
        version="1.1"
        width="14"
      >
        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
      </IssueIcon>
      <span>{t('button')}</span>
      <small
        style={{
          fontSize: '0.6875rem',
          fontWeight: 400,
          opacity: 0.7,
        }}
      >
        {t('description')}
      </small>
    </ReportLink>
  );
}
