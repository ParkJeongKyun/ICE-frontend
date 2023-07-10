import { ConfigProvider, FloatButton, Radio } from "antd";
import IceModal from "components/IceModal/IceModal";
import BoxIcon from "components/Icons/BoxIcon";
import DotsIcon from "components/Icons/DotsIcon";
import ProfileIcon from "components/Icons/ProfileIcon";
import SnowFlakeIcon from "components/Icons/SnowFlakeIcon";
import SnowFlakeOffIcon from "components/Icons/SnowFlakeOffIcon";
import XIcon from "components/Icons/XIcon";
import SnowfallComponent from "components/SnowfallComponent/SnowfallComponent";
import IceBase64 from "IceBase64/IceBase64";
import ExifAnalyzer from "IceContainer/ExifAnalyzer/ExifAnalyzer";
import { IceContainer } from "IceContainer/styles";
import IceInfomation from "IceInfomation/IceInfomation";
import React, { useEffect, useState } from "react";
import { IceCopy, IceRButton } from "styles";

function App() {
  // 눈 송이 개수
  const [snowflake, setSnowflake] = useState(true);
  // 드로워 옵션
  const [open, setOpen] = useState(false);
  // 모달 옵션
  const [isModalOpen, setIsModalOpen] = useState(false);

  //테마
  const theme = {
    token: {
      // 메인 테마 설정
      colorPrimary: "rgb(0, 166, 237)",
    },
  };
  // ==========================

  // 드로워 핸들러
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  // ==========================

  // 모달 핸들러
  const showModal = () => {
    setIsModalOpen((prev) => {
      return !prev;
    });
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // ==========================

  // 눈 송이 끄기
  const onChange = () => {
    setSnowflake((prev) => {
      // 로컬 스토리지에 snowflake 값 저장
      localStorage.setItem("snowflake", String(!prev));
      return !prev;
    });
  };
  // ==========================

  // 로컬 스토리지에서 snowflake 값 불러오기
  useEffect(() => {
    const storedSnowflake = localStorage.getItem("snowflake");
    if (storedSnowflake !== null) {
      setSnowflake(storedSnowflake === "true");
    }
  }, []);
  // ==========================

  return (
    <ConfigProvider theme={theme}>
      <div className="App">
        {/* 눈 송이 */}
        <SnowfallComponent snowflakeCount={snowflake ? 150 : 0} />

        {/* 중단 메인 컨테이너 */}
        <IceContainer>
          <ExifAnalyzer />
        </IceContainer>

        {/* 중단 고정 부분 저작권 */}
        <IceCopy>
          <span>&copy; Jeongkyun-Park. All rights reserved.</span>
          <br />
          <span> dbzoseh84@gmail.com</span>
        </IceCopy>

        {/* 우고정 부분 */}
        {/* 플로팅 버튼 그룹*/}
        <IceRButton
          trigger="hover"
          closeIcon={<XIcon color="var(--main-line-color)" />}
          icon={<DotsIcon color="var(--main-line-color)" />}
        >
          {/* 플로팅 버튼 그룹들 */}
          <FloatButton
            tooltip={<div>배경 눈 설정</div>}
            onClick={onChange}
            icon={
              snowflake ? (
                <SnowFlakeOffIcon color="var(--main-line-color)" />
              ) : (
                <SnowFlakeIcon color="var(--main-line-color)" />
              )
            }
          />
          <FloatButton
            tooltip={<div>테스트용 모달</div>}
            icon={<BoxIcon color="var(--main-line-color)" />}
            onClick={showModal}
          />
          <FloatButton
            tooltip={<div>사이트 정보</div>}
            icon={<ProfileIcon color="var(--main-line-color)" />}
            onClick={showDrawer}
          />
        </IceRButton>

        {/* 드로워 */}
        <IceInfomation open={open} showDrawer={showDrawer} onClose={onClose} />

        {/* 모달 */}
        <IceModal
          title="모달 테스트"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <IceBase64 />
        </IceModal>
      </div>
    </ConfigProvider>
  );
}

export default App;
