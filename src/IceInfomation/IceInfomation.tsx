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
    ></IceDrawer>
  );
}
