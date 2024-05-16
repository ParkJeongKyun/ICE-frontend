import { Tabs, TabsProps } from "antd";
import { useState } from "react";
import DeveloperInfo from "./DeveloperInfo/DeveloperInfo";
import SourceInfo from "./SourceInfo/SourceInfo";
import { IceDrawer, IceTabs } from "./styles";
import UpdateHistory from "./UpdateHistory/UpdateHistory";

interface Props {
  open: boolean;
  showDrawer: () => void;
  onClose: () => void;
}

export default function IceInfomation({ open, showDrawer, onClose }: Props) {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `개발자`,
      children: <DeveloperInfo />,
    },
    {
      key: "2",
      label: `업데이트`,
      children: <UpdateHistory />,
    },
    {
      key: "3",
      label: `참고소스출처`,
      children: <SourceInfo />,
    },
  ];
  return (
    <IceDrawer
      placement="left"
      onClose={onClose}
      closable={false} // 클로즈 버튼 제거
      footer={null}
      open={open}
    >
      <IceTabs type="card" defaultActiveKey="1" items={items} />
    </IceDrawer>
  );
}
