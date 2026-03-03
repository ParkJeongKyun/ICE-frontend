'use client';

import { useRefs } from '@/contexts/RefContext/RefContext';
import {
  Btn,
  HomeDiv,
  LeftSection,
  RightSection,
  ContentWrapper,
  TitleDiv,
  InfoDiv,
  StartDiv,
  SubTitle,
  Title,
  Version,
  SubTitleDiv,
  PrivacyLink,
  ContientDiv,
} from './Home.styles';
import PreviewFaqUseCases from './PreviewFaqUseCases';
import Logo from '../common/Icons/Logo/Logo';
import { useTranslations, useLocale } from 'next-intl';

const Home: React.FC = () => {
  const { menuBtnZoneRef } = useRefs();
  const t = useTranslations();
  const locale = useLocale();

  return (
    <HomeDiv>
      <LeftSection>
        <ContentWrapper>
          <ContientDiv>
            <TitleDiv>
              <Title>
                <Logo showText size={36} textSize={36} />
                <Version>
                  <span>{process.env.NEXT_PUBLIC_APP_VERSION}</span>
                </Version>
              </Title>
              <SubTitleDiv>
                <SubTitle>{t('home.subtitle1')}</SubTitle>
                <SubTitle>{t('home.subtitle2')}</SubTitle>
                <SubTitle>{t('home.subtitle3')}</SubTitle>
                <SubTitle>{t('home.subtitle4')}</SubTitle>
              </SubTitleDiv>
            </TitleDiv>

            <StartDiv>
              {t('home.startGuide')}
              <Btn onClick={() => menuBtnZoneRef.current?.openBtnClick()}>
                {t('home.openFile')}
              </Btn>
              <Btn onClick={() => menuBtnZoneRef.current?.docsBtnClick()}>
                {t('home.docs')}
              </Btn>
              <Btn onClick={() => menuBtnZoneRef.current?.aboutBtnClick()}>
                {t('home.about')}
              </Btn>
            </StartDiv>

            <InfoDiv>
              <div>{t('home.browserBased')}</div>
              <div>
                <PrivacyLink
                  href={`/${locale}/privacy`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('home.privacyPolicy')}
                </PrivacyLink>
              </div>
              <div>{t('home.noServerUpload')}</div>
              <div>{t('copyright')}</div>
            </InfoDiv>
          </ContientDiv>
        </ContentWrapper>
      </LeftSection>

      <RightSection>
        <ContentWrapper>
          <ContientDiv>
            <PreviewFaqUseCases />
          </ContientDiv>
        </ContentWrapper>
      </RightSection>
    </HomeDiv>
  );
};

export default Home;
