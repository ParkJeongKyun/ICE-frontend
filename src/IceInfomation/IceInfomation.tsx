import { Tabs } from "antd";
import { useState } from "react";
import DeveloperInfo from "./DeveloperInfo/DeveloperInfo";
import { IceDrawer, IceTabs } from "./styles";

interface Props {
  open: boolean;
  showDrawer: () => void;
  onClose: () => void;
}

export default function IceInfomation({ open, showDrawer, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("tab1");
  return (
    <IceDrawer
      placement="left"
      onClose={onClose}
      closable={false} // 클로즈 버튼 제거
      footer={null}
      open={open}
    >
      <IceTabs type="card" activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="개발자" key="tab1">
          <DeveloperInfo />
        </Tabs.TabPane>
        <Tabs.TabPane tab="업데이트" key="tab2">
          업데이트트
        </Tabs.TabPane>
        <Tabs.TabPane tab="참고출처" key="tab3">
          참고소스 출처
        </Tabs.TabPane>
      </IceTabs>
    </IceDrawer>
  );
}
