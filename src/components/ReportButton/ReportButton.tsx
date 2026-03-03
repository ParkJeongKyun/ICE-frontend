'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';

const ReportLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--main-hover-line-color);
  border-radius: 0.5rem;
  color: var(--ice-main-color);
  background: linear-gradient(
    135deg,
    rgba(96, 200, 255, 0.08) 0%,
    rgba(96, 200, 255, 0.02) 100%
  );
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    border-color: var(--ice-main-color);
    background: linear-gradient(
      135deg,
      rgba(96, 200, 255, 0.15) 0%,
      rgba(96, 200, 255, 0.05) 100%
    );
    box-shadow:
      0 0 20px rgba(96, 200, 255, 0.2),
      inset 0 0 12px rgba(96, 200, 255, 0.05);
    color: var(--main-bg-color-primary);

    &::before {
      left: 100%;
    }

    svg {
      transform: scale(1.2) rotate(15deg);
      filter: drop-shadow(0 0 6px rgba(96, 200, 255, 0.6));
    }
  }

  &:active {
    transform: scale(0.98);
  }

  span {
    font-weight: 600;
    letter-spacing: 0.3px;
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
        height="16"
        viewBox="0 0 16 16"
        version="1.1"
        width="16"
      >
        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
      </IssueIcon>
      <span>
        {t('button')} - {t('description')}
      </span>
    </ReportLink>
  );
}
