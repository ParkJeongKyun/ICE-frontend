import { Avatar, Card, Tag } from 'antd';
import Meta from 'antd/es/card/Meta';
import { IceAvatar } from 'components/common/IceAvatar/styles';
import { IceCard } from 'components/common/IceCard/styles';

export default function DeveloperInfo() {
  return (
    <>
      <IceCard
      // actions={[
      //   <Tag color="#2db7f5">개발자</Tag>,
      //   <Tag color="#2db7f5">디지털포렌식</Tag>,
      //   <Tag color="#2db7f5">보안</Tag>,
      // ]}
      >
        <Meta
          avatar={<IceAvatar size={100} src="kyun.jpg" />}
          title={
            <>
              박정균 <br />
              (Park Jeong-Kyun)
            </>
          }
          description={
            <>
              <Tag color="#2db7f5">개발자</Tag>
              <Tag color="#2db7f5">디지털포렌식</Tag>
              <Tag color="#2db7f5">보안</Tag>
              <br />
              dbzoseh84@gmail.com
            </>
          }
        />
      </IceCard>
    </>
  );
}
