import { MenuBtnZoneRef } from 'components/MenuBtnZone';
import {
  Btn,
  HomeDiv,
  StartDiv,
  SubTitle,
  Title,
  Version,
} from './index.styles';

interface Props {
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef>;
}

const Home: React.FC<Props> = ({ menuBtnZoneRef }) => {
  return (
    <HomeDiv>
      <div>
        <Title>
          ICE<Version>{process.env.REACT_APP_VERSION}</Version>
        </Title>
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
      </div>
    </HomeDiv>
  );
};
export default Home;
