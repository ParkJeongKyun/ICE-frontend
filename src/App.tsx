import { Drawer } from "antd";
import DotsIcon from "components/Icons/DotsIcon";
import ListSearchIcon from "components/Icons/ListSearchIcon";
import SnowfallComponent from "components/SnowfallComponent/SnowfallComponent";
import ExifAnalyzer from "IceContainer/ExifAnalyzer/ExifAnalyzer";
import { IceContainer } from "IceContainer/styles";
import IceInfomation from "IceInfomation/IceInfomation";
import React, { useState } from "react";
import { IceRBContainer, IceRButton } from "styles";

function App() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  return (
    <div className="App">
      <SnowfallComponent />
      <IceContainer>
        <ExifAnalyzer />
      </IceContainer>
      <IceRBContainer>
        <IceRButton onClick={showDrawer}>
          <ListSearchIcon />
        </IceRButton>
      </IceRBContainer>
      <IceInfomation open={open} showDrawer={showDrawer} onClose={onClose} />
    </div>
  );
}

export default App;
