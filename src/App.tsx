import ListSearchIcon from "components/Icons/ListSearchIcon";
import SnowFlakeIcon from "components/Icons/SnowFlakeIcon";
import SnowFlakeOffIcon from "components/Icons/SnowFlakeOffIcon";
import SnowfallComponent from "components/SnowfallComponent/SnowfallComponent";
import ExifAnalyzer from "IceContainer/ExifAnalyzer/ExifAnalyzer";
import { IceContainer } from "IceContainer/styles";
import IceInfomation from "IceInfomation/IceInfomation";
import React, { useState } from "react";
import {
  IceCopy,
  IceLBContainer,
  IceLSwicth,
  IceRBContainer,
  IceRButton,
} from "styles";

function App() {
  // 눈 송이 개수
  const [snowflakeCount, setSnowflakeCount] = useState(150);
  // 드로워 옵션
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // 눈 송이 끄기
  const onChange = (checked: boolean) => {
    setSnowflakeCount((prev) => {
      return checked ? 0 : 150;
    });
  };

  return (
    <div className="App">
      {/* 눈 송이 */}
      <SnowfallComponent snowflakeCount={snowflakeCount} />

      {/* 중단 메인 컨테이너 */}
      <IceContainer>
        <ExifAnalyzer />
      </IceContainer>

      {/* 좌 고정 부분 */}
      <IceLBContainer>
        <IceLSwicth
          unCheckedChildren={<SnowFlakeIcon width={12} height={12} />}
          checkedChildren={<SnowFlakeOffIcon width={12} height={12} />}
          onChange={onChange}
        />
      </IceLBContainer>

      {/* 중단 고정 부분 저작권 */}
      <IceCopy>
        <span>&copy; Jeongkyun-Park. All rights reserved.</span>
        <br />
        <span> dbzoseh84@gmail.com</span>
      </IceCopy>

      {/* 우고정 부분 */}
      <IceRBContainer>
        <IceRButton onClick={showDrawer}>
          <ListSearchIcon />
        </IceRButton>
      </IceRBContainer>

      {/* 드로워 */}
      <IceInfomation open={open} showDrawer={showDrawer} onClose={onClose} />
    </div>
  );
}

export default App;
