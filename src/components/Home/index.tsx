import { MenuBtnZoneRef } from 'components/MenuBtnZone';
import {
  Btn,
  HomeDiv,
  InfoDiv,
  StartDiv,
  SubTitle,
  Title,
  Version,
} from './index.styles';
import { isMobile } from 'react-device-detect';

interface Props {
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef>;
}

const Home: React.FC<Props> = ({ menuBtnZoneRef }) => {
  return (
    <HomeDiv>
      <div>
        <div>
          <Title>ICE</Title>
          <Version>
            <span>
              {process.env.REACT_APP_VERSION}
              {isMobile && '_Mobile'}
            </span>
          </Version>
        </div>
        <SubTitle>이미지 메타데이터 분석</SubTitle>
        <SubTitle>파일 HEX 뷰어</SubTitle>
        <SubTitle>웹 애플리케이션</SubTitle>

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
          <div>파일 업로드시 서버에 저장되지 않음</div>
          <div>{process.env.REACT_APP_COPYRIGHT}</div>
        </InfoDiv>
      </div>
    </HomeDiv>
  );
};
export default Home;
