import { IceTabs } from 'components/common/old/IceInfomation/styles';
import BigMenuBtn from './BIgMenuBtn';
import {
  IceContent,
  IceFooter,
  IceHeader,
  IceLayout,
  IceLeftSider,
  IceMainLayout,
  IceRightSider,
  LogoDiv,
  LogoImage,
} from './index.styles';
import { useRef, useState } from 'react';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const defaultPanes = new Array(2).fill(null).map((_, index) => {
  const id = String(index + 1);
  return {
    label: `Tab ${id}`,
    children: `Content of Tab Pane ${index + 1}`,
    key: id,
  };
});

const MainLayout: React.FC = () => {
  const [activeKey, setActiveKey] = useState(defaultPanes[0].key);
  const [items, setItems] = useState(defaultPanes);
  const newTabIndex = useRef(0);

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const add = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    setItems([
      ...items,
      { label: 'New Tab', children: 'New Tab Pane', key: newActiveKey },
    ]);
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey: TargetKey) => {
    const targetIndex = items.findIndex((pane) => pane.key === targetKey);
    const newPanes = items.filter((pane) => pane.key !== targetKey);
    if (newPanes.length && targetKey === activeKey) {
      const { key } =
        newPanes[
          targetIndex === newPanes.length ? targetIndex - 1 : targetIndex
        ];
      setActiveKey(key);
    }
    setItems(newPanes);
  };

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };

  return (
    <IceMainLayout>
      <IceHeader>
        <LogoDiv>
          <LogoImage src={'pullLogo.png'} preview={false} />
        </LogoDiv>
        <BigMenuBtn onClick={() => {}} text="Open" />
        <BigMenuBtn onClick={() => {}} text="Save" />
        <BigMenuBtn onClick={() => {}} text="Help" />
        <BigMenuBtn onClick={() => {}} text="About" />
      </IceHeader>
      <IceLayout>
        <IceLeftSider width={300}></IceLeftSider>
        <IceContent>
          <IceTabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
            items={items}
          />
        </IceContent>
        <IceRightSider width={300}></IceRightSider>
      </IceLayout>
      <IceFooter></IceFooter>
    </IceMainLayout>
  );
};

export default MainLayout;
