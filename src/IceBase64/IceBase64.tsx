import { IceButton } from "components/IceButton/styles";
import { IceTextArea } from "components/IceTextArea/styles";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

// Base64 인/디코더
export default function IceBase64() {
  //  입력 텍스트
  const [inputText, setInputText] = useState("");
  // 인코딩 텍스트
  const [encodedText, setEncodedText] = useState("");
  // 디코딩 텍스트
  const [decodedText, setDecodedText] = useState("");

  // input 변경감지
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  //  Base64 인코딩 함수
  const encodeBase64 = () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const dataArray = Array.from(data);
      const base64 = btoa(String.fromCharCode(...dataArray));
      setEncodedText(base64);
    } catch (error) {
      //   console.error("Failed to encode Base64:", error);
      setEncodedText("");
    }
  };

  // Base64 디코딩 함수
  const decodeBase64 = () => {
    try {
      const decoded = atob(inputText);
      const dataArray = Array.from(decoded, (c) => c.codePointAt(0)!);
      const decodedText = String.fromCodePoint(...dataArray);
      setDecodedText(decodedText);
    } catch (error) {
      //   console.error("Invalid Base64 string");
      setDecodedText("");
    }
  };

  return (
    <div>
      <div>
        <label>Input Text</label>
        <IceTextArea
          value={inputText}
          onChange={handleInputChange}
          onBlur={() => {
            encodeBase64();
            decodeBase64();
          }}
        />
      </div>
      <div>
        <label>Encoded Text</label>
        <IceTextArea value={encodedText} />
        <CopyToClipboard text={encodedText}>
          <IceButton>Copy to Clipboard</IceButton>
        </CopyToClipboard>
      </div>
      <div>
        <label>Decoded Text</label>
        <IceTextArea value={decodedText} />
        <CopyToClipboard text={decodedText}>
          <IceButton>Copy to Clipboard</IceButton>
        </CopyToClipboard>
      </div>
    </div>
  );
}
