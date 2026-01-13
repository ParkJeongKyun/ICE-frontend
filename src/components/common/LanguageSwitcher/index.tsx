import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import USFlagIcon from '../Icons/USFlagIcon';
import KRFlagIcon from '../Icons/KRFlagIcon';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'en' ? 'ko' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const currentLangName = i18n.language === 'en' ? 'English' : '한국어';
  const isEnglish = i18n.language === 'en';

  return (
    <FlagButton
      onClick={handleLanguageToggle}
      title={`Current: ${currentLangName} (Click to switch)`}
    >
      {isEnglish ? (
        <USFlagIcon width={28} height={18} />
      ) : (
        <KRFlagIcon width={28} height={18} />
      )}
    </FlagButton>
  );
};

const FlagButton = styled.button`
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;

  svg {
    display: block;
  }

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default LanguageSwitcher;
