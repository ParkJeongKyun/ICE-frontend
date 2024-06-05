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
        <SubTitle>Free Forensic Web Application</SubTitle>

        <StartDiv>
          Start
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.openBtnClick();
            }}
          >
            Open...
          </Btn>
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.helpBtnClick();
            }}
          >
            Help...
          </Btn>
          <Btn
            onClick={() => {
              menuBtnZoneRef.current?.aboutBtnClick();
            }}
          >
            About...
          </Btn>
        </StartDiv>
      </div>
    </HomeDiv>
  );
};
export default Home;
