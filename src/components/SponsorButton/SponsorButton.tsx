'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import HeartIcon from '../common/Icons/HeartIcon';
import CoffeeIcon from '../common/Icons/CoffeeIcon';

const SponsorContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const SponsorLink = styled.a`
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
  background: transparent;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    svg {
      transform: scale(1.15);
    }
  }

  &:active {
    transform: scale(0.97);
  }
`;

const GitHubSponsorLink = styled(SponsorLink)`
  color: var(--ice-main-color-love);

  padding-right: 0.25rem;
  border-radius: 0.375rem 0 0 0.375rem;
  &:hover {
    background: rgba(255, 107, 138, 0.1);
    border-color: rgba(255, 107, 138, 0.3);

    svg {
      filter: drop-shadow(0 0 4px rgba(255, 107, 138, 0.5));
    }
  }
`;

const KoFiLink = styled(SponsorLink)`
  color: var(--ice-main-color-love);
  padding-left: 0.25rem;
  border-radius: 0 0.375rem 0.375rem 0;
  &:hover {
    background: rgba(255, 107, 138, 0.1);
    border-color: rgba(255, 107, 138, 0.3);

    svg {
      filter: drop-shadow(0 0 4px rgba(255, 107, 138, 0.5));
    }
  }
`;

export default function SponsorButton() {
  const t = useTranslations('sponsor');

  return (
    <SponsorContainer>
      <GitHubSponsorLink
        href={process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={t('ariaLabel')}
        aria-label={t('ariaLabel')}
      >
        <HeartIcon width={14} height={14} color="var(--ice-main-color-love)" />
      </GitHubSponsorLink>

      <KoFiLink
        href={process.env.NEXT_PUBLIC_KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={t('description')}
        aria-label={t('description')}
      >
        <CoffeeIcon width={14} height={14} color="var(--ice-main-color-love)" />
        <small
          style={{
            fontSize: '0.6875rem',
            fontWeight: 400,
          }}
        >
          {t('description')}
        </small>
      </KoFiLink>
    </SponsorContainer>
  );
}
