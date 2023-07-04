import ExifDataTree from "./ExifDataTree/ExifDataTree";
import React, { useEffect, useState } from "react";
import { ExifRow } from "types/types";
import ImgDropzone from "./ImgDropzone/ImgDropzone";
import { IceFrame } from "IceContainer/styles";
import { getDate } from "utils/getDate";
import { getBytes } from "utils/getBytes";
import { IceExifInfo, IceImageInfo, IceStatistic } from "./styles";

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
              <IceImageInfo>
                <IceStatistic title="파일 이름" value={file.name} />

                <IceStatistic
                  title="최근수정시간"
                  value={getDate(file.lastModified)}
                />
                <IceStatistic title="파일 크기" value={getBytes(file.size)} />
              </IceImageInfo>
              <ExifDataTree rows={rows} />
            </IceExifInfo>
          </>
        )}
      </IceFrame>
    </>
  );
}
