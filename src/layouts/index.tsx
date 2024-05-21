import BigMenuBtn from './BIgMenuBtn';
import {
  IceContent,
  IceFooter,
  IceHeader,
  IceLayout,
  IceLeftSider,
  IceMainLayout,
  IceRightSider,
  LogoImage,
} from './index.styles';

const MainLayout: React.FC = () => {
  return (
    <IceMainLayout>
      <IceHeader>
        <LogoImage src={'pullLogo.png'} preview={false} />
        <BigMenuBtn onClick={() => {}} text="Open" />
        <BigMenuBtn onClick={() => {}} text="Save" />
        <BigMenuBtn onClick={() => {}} text="Help" />
        <BigMenuBtn onClick={() => {}} text="About" />
      </IceHeader>
      <IceLayout>
        <IceLeftSider width={300}></IceLeftSider>
        <IceContent></IceContent>
        <IceRightSider width={300}></IceRightSider>
      </IceLayout>
      <IceFooter></IceFooter>
    </IceMainLayout>
  );
};

export default MainLayout;
