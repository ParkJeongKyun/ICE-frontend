import React from 'react';
import PrivacyIcon from '../Icons/PrivacyIcon';
import styled from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import Tooltip from '../Tooltip/Tooltip';

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
  const locale = useLocale();
  const t = useTranslations();
  return (
    <Tooltip text={t('home.privacyPolicy')}>
      <Btn
        className={className}
        aria-label={t('home.privacyPolicy')}
        onClick={() => {
          window.open(`/${locale}/privacy`, '_blank', 'noopener,noreferrer');
        }}
      >
        <PrivacyIcon />
      </Btn>
    </Tooltip>
  );
};

export default PrivacyBtn;
