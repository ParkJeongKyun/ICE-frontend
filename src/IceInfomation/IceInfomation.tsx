import { Tabs, TabsProps } from "antd";
import { useState } from "react";
import DeveloperInfo from "./DeveloperInfo/DeveloperInfo";
import { IceDrawer, IceTabs } from "./styles";

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
      children: `업데이트`,
    },
    {
      key: "3",
      label: `소스출처`,
      children: `소스 출처`,
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
