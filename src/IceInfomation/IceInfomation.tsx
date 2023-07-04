import { Avatar, Card, Space, Tag } from "antd";
import Meta from "antd/es/card/Meta";
import Logo from "components/Logo/Logo";
import { IceDrawer } from "./styles";

interface Props {
  open: boolean;
  showDrawer: () => void;
  onClose: () => void;
}

export default function IceInfomation({ open, showDrawer, onClose }: Props) {
  return (
    <IceDrawer
      // title={<Logo />}
      placement="right"
      onClose={onClose}
      open={open}
    >
      개발자
      <Card
        actions={[
          <Tag color="#2db7f5">개발자</Tag>,
          <Tag color="#2db7f5">디지털포렌식</Tag>,
          <Tag color="#2db7f5">보안</Tag>,
        ]}
      >
        <Meta
          avatar={<Avatar size={100} src="kyun.jpg" />}
          title="박정균"
          description="(Park Jeong-Kyun) dbzoseh84@gmail.com"
        />
      </Card>
      아직 데모 페이지 테스트 중입니다.
      <br />
      추후 업데이트 예정
      <Space></Space>
    </IceDrawer>
  );
}
