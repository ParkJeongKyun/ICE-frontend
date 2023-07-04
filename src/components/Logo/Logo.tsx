import { LogoContainer, LogoImage } from "./styles";

export default function Logo() {
  return (
    <LogoContainer>
      <LogoImage src={"logo.png"} preview={false} />
      ICE
    </LogoContainer>
  );
}
