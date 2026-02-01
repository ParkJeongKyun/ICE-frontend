'use client';

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/locales/routing';
import styled from 'styled-components';
import USFlagIcon from '../Icons/USFlagIcon';
import KRFlagIcon from '../Icons/KRFlagIcon';
import Tooltip from '../Tooltip/Tooltip';

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageToggle = () => {
    const nextLocale = locale === 'en' ? 'ko' : 'en';
    localStorage.setItem('user-locale', nextLocale);

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const currentLangName = locale === 'en' ? 'English' : '한국어';
  const isEnglish = locale === 'en';

  return (
    <Tooltip text={`Current: ${currentLangName} (Click to switch)`}>
      <FlagButton
        onClick={handleLanguageToggle}
        aria-label={`Switch language (current: ${currentLangName})`}
      >
        <span className="current" aria-hidden={false}>
          {isEnglish ? (
            <USFlagIcon width={30} height={20} />
          ) : (
            <KRFlagIcon width={30} height={20} />
          )}
        </span>
        <span className="overlay left" aria-hidden="true">
          <USFlagIcon width={30} height={20} />
        </span>
        <span className="overlay right" aria-hidden="true">
          <KRFlagIcon width={30} height={20} />
        </span>
      </FlagButton>
    </Tooltip>
  );
};
const FlagButton = styled.button`
  position: relative;
  overflow: hidden;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  transition:
    color 0.18s ease,
    background 0.18s ease;
  border-radius: 0;

  /* 기본 current flag */
  .current {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s ease;
  }

  /* overlay spans are absolute and clipped to diagonal halves */
  .overlay {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    transition:
      opacity 0.12s ease,
      transform 0.12s ease;
    z-index: 1;
  }

  .overlay.left {
    clip-path: polygon(0 0, 100% 0, 0 100%); /* 대각선 분할 - 왼쪽/위 삼각형 */
  }

  .overlay.right {
    clip-path: polygon(
      100% 0,
      100% 100%,
      0 100%
    ); /* 대각선 분할 - 오른쪽/아래 삼각형 */
  }

  &:hover {
    background-color: var(--main-hover-color);
    .current {
      opacity: 0;
    }

    .overlay {
      opacity: 1;
      transform: translateY(-50%) scale(1.01);
    }
  }
`;

export default LanguageSwitcher;
