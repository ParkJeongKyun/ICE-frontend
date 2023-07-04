import ExifDataTree from "./ExifDataTree/ExifDataTree";
import React, { useEffect, useState } from "react";
import { ExifRow } from "types/types";
import ImgDropzone from "./ImgDropzone/ImgDropzone";
import { IceFrame } from "IceContainer/styles";
import { getDate } from "utils/getDate";
import { getBytes } from "utils/getBytes";
import { IceCol, IceExifInfo, IceRow } from "./styles";

// 세부 정보
export default function ExifAnalyzer() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [rows, setRows] = useState<ExifRow[]>([]);

  useEffect(() => {
    const loadWebAssembly = async () => {
      const go = new Go();
      const wasmModule = await WebAssembly.instantiateStreaming(
        fetch("wasm/main.wasm"),
        go.importObject
      );
      go.run(wasmModule.instance);
    };

    loadWebAssembly();
  }, []);

  return (
    <>
      <IceFrame>
        <ImgDropzone setFile={setFile} setRows={setRows} />
        {file && (
          <>
            <IceExifInfo>
              <IceRow gutter={[5, 5]}>
                <IceCol span={7}>파일 이름</IceCol>
                <IceCol span={17}>{file.name}</IceCol>
                <IceCol span={7}>최근수정시간</IceCol>
                <IceCol span={17}>{getDate(file.lastModified)}</IceCol>
                <IceCol span={7}>파일 크기</IceCol>
                <IceCol span={17}>{getBytes(file.size)}</IceCol>
              </IceRow>
              <ExifDataTree rows={rows} />
            </IceExifInfo>
          </>
        )}
      </IceFrame>
    </>
  );
}
