import { MenuBtnZoneRef } from 'components/MenuBtnZone';
import { IceWelcome } from './index.styles';

interface Props {
  menuBtnZoneRef: React.RefObject<MenuBtnZoneRef>;
}

const Home: React.FC<Props> = ({ menuBtnZoneRef }) => {
  return (
    <IceWelcome>
      <div>
        <span
          onClick={() => {
            menuBtnZoneRef.current?.openBtnClick();
          }}
        >
          OPEN
        </span>
      </div>
    </IceWelcome>
  );
};
export default Home;
