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
      <Card
        actions={[
          <Tag color="#2db7f5">히히</Tag>,
          <Tag color="#2db7f5">히히</Tag>,
          <Tag color="#2db7f5">히히</Tag>,
        ]}
      >
        <Meta
          avatar={<Avatar size={100} src="kyun.jpg" />}
          title="박정균(Park Jeong-Kyun)"
          description="dbzoseh84@gmail.com"
        />
      </Card>
      <Space></Space>
    </IceDrawer>
  );
}
