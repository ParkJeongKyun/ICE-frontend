import { LogoContainer, LogoImage } from "./styles";

export default function Logo() {
  return (
    <LogoContainer>
      <LogoImage src={"pullLogo.png"} preview={false} />
    </LogoContainer>
  );
}
