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
  // 원본 파일
  const [file, setFile] = useState<File | undefined>(undefined);
  // EXIF 메타데이터 분석 결과
  const [rows, setRows] = useState<ExifRow[]>([]);

  // GO 웹 어셈블리 모듈 로드
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
        {/* 이미지드롭존 */}
        <ImgDropzone setFile={setFile} setRows={setRows} />
        {/* 파일이 성공적으로 읽어진 경우 */}
        {file && (
          <>
            <IceExifInfo>
              {/* 이미지 정보 */}
              <IceImageInfo>
                <IceStatistic title="파일 이름" value={file.name} />
                <IceStatistic
                  title="최근수정시간"
                  value={getDate(file.lastModified)}
                />
                <IceStatistic title="파일 크기" value={getBytes(file.size)} />
              </IceImageInfo>
              {/* 이미지 EXIF 메타데이터 정보 */}
              <ExifDataTree rows={rows} />
            </IceExifInfo>
          </>
        )}
      </IceFrame>
    </>
  );
}
