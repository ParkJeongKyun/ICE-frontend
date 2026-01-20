import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import USFlagIcon from '../Icons/USFlagIcon';
import KRFlagIcon from '../Icons/KRFlagIcon';
import Tooltip from '../Tooltip';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'en' ? 'ko' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const currentLangName = i18n.language === 'en' ? 'English' : '한국어';
  const isEnglish = i18n.language === 'en';

  return (
    <Tooltip text={`Current: ${currentLangName} (Click to switch)`}>
      <FlagButton
        onClick={handleLanguageToggle}
      >
        {isEnglish ? (
          <USFlagIcon width={28} height={18} />
        ) : (
          <KRFlagIcon width={28} height={18} />
        )}
      </FlagButton>
    </Tooltip>
  );
};
const FlagButton = styled.button`
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

export default LanguageSwitcher;
