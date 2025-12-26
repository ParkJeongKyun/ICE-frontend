import { MenuBtnZoneRef } from '@/components/MenuBtnZone';
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
import { RefObject } from 'react';

interface Props {
  menuBtnZoneRef: RefObject<MenuBtnZoneRef | null>;
}

const Home: React.FC<Props> = ({ menuBtnZoneRef }) => {
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
            <SubTitle>이미지 메타데이터 분석</SubTitle>
            <SubTitle>파일 HEX 뷰어</SubTitle>
            <SubTitle>웹 애플리케이션</SubTitle>
          </SubTitleDiv>
        </TitleDiv>
        <StartDiv>
          시작하기
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.openBtnClick();
            }}
          >
            파일 열기...
          </Btn>
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.helpBtnClick();
            }}
          >
            도움말...
          </Btn>
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.aboutBtnClick();
            }}
          >
            사이트 정보...
          </Btn>
        </StartDiv>
        <InfoDiv>
          <div>웹 브라우저 기반으로 동작</div>
          <div>수집 및 처리되는 개인정보 없음</div>
          <div>파일을 열어도 서버에 업로드 및 저장되지 않음</div>
          <div>{import.meta.env.VITE_APP_COPYRIGHT}</div>
        </InfoDiv>
      </ContientDiv>
    </HomeDiv>
  );
};
export default Home;
