import React from 'react';
import PrivacyIcon from '../Icons/PrivacyIcon';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import Tooltip from '../Tooltip/Tooltip';
import { Link } from '@/locales/routing';

export const Btn = styled.button`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-color);
  transition: all 0.2s;
  border-radius: 0;

  &:hover {
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
  }
`;

const PrivacyBtn: React.FC<{ className?: string }> = ({ className }) => {
  const t = useTranslations();
  return (
    <Tooltip text={t('home.privacyPolicy')}>
      <Link
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <Btn
          className={className}
          aria-label={t('home.privacyPolicy')}
          as="span"
        >
          <PrivacyIcon />
        </Btn>
      </Link>
    </Tooltip>
  );
};

export default PrivacyBtn;
