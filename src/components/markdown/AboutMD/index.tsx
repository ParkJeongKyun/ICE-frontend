import ICEMarkDown from '..';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

// 정적 import
import enAbout from '@/locales/en/markdown/about.md?raw';
import enRelease from '@/locales/en/markdown/release.md?raw';
import enUpdate from '@/locales/en/markdown/update.md?raw';
import koAbout from '@/locales/ko/markdown/about.md?raw';
import koRelease from '@/locales/ko/markdown/release.md?raw';
import koUpdate from '@/locales/ko/markdown/update.md?raw';

const markdownMap = {
  en: { about: enAbout, release: enRelease, update: enUpdate },
  ko: { about: koAbout, release: koRelease, update: koUpdate },
};

const AboutMD: React.FC = () => {
  const { i18n } = useTranslation();

  const texts = useMemo(() => {
    const lang = (i18n.language === 'en' ? 'en' : 'ko') as keyof typeof markdownMap;
    return markdownMap[lang];
  }, [i18n.language]);

  return (
    <ICEMarkDown
      defaultText={texts.about}
      childTexts={{
        relase: texts.release,
        update: texts.update,
      }}
    />
  );
};

export default AboutMD;
