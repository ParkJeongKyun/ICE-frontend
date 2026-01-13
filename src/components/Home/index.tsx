import { useRefs } from '@/contexts/RefContext';
import {
  Btn,
  HomeDiv,
  ContientDiv,
  TitleDiv,
  InfoDiv,
  StartDiv,
  SubTitle,
  Title,
  Version,
  SubTitleDiv,
} from './index.styles';
import { isMobile } from 'react-device-detect';
import Logo from '../common/Icons/Logo';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { menuBtnZoneRef } = useRefs();
  const { t } = useTranslation();

  return (
    <HomeDiv>
      <ContientDiv>
        <TitleDiv>
          <Title>
            <Logo showText size={36} textSize={36} />
            <Version>
              <span>
                {import.meta.env.VITE_APP_VERSION}
                {isMobile && '_Mobile'}
              </span>
            </Version>
          </Title>
          <SubTitleDiv>
            <SubTitle>{t('home.subtitle1')}</SubTitle>
            <SubTitle>{t('home.subtitle2')}</SubTitle>
            <SubTitle>{t('home.subtitle3')}</SubTitle>
          </SubTitleDiv>
        </TitleDiv>
        <StartDiv>
          {t('home.startGuide')}
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.openBtnClick();
            }}
          >
            {t('home.openFile')}
          </Btn>
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.helpBtnClick();
            }}
          >
            {t('home.help')}
          </Btn>
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.aboutBtnClick();
            }}
          >
            {t('home.about')}
          </Btn>
        </StartDiv>
        <InfoDiv>
          <div>{t('home.browserBased')}</div>
          <div>{t('home.noPersonalData')}</div>
          <div>{t('home.noServerUpload')}</div>
          <div>{import.meta.env.VITE_APP_COPYRIGHT}</div>
        </InfoDiv>
      </ContientDiv>
    </HomeDiv>
  );
};
export default Home;
