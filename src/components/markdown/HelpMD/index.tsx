import ICEMarkDown from '..';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

// 정적 import
import enHelp from '@/locales/en/markdown/help.md?raw';
import enHowToUse from '@/locales/en/markdown/howToUse.md?raw';
import koHelp from '@/locales/ko/markdown/help.md?raw';
import koHowToUse from '@/locales/ko/markdown/howToUse.md?raw';

const markdownMap = {
  en: { help: enHelp, howToUse: enHowToUse },
  ko: { help: koHelp, howToUse: koHowToUse },
};

const HelpMD: React.FC = () => {
  const { i18n } = useTranslation();

  const texts = useMemo(() => {
    const lang = (i18n.language === 'en' ? 'en' : 'ko') as keyof typeof markdownMap;
    return markdownMap[lang];
  }, [i18n.language]);

  return (
    <ICEMarkDown
      defaultText={texts.help}
      childTexts={{
        howToUse: texts.howToUse,
      }}
    />
  );
};

export default HelpMD;
