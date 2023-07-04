import Logo from "components/Logo/Logo";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ExifRow } from "types/types";
import { getAddress } from "utils/getAddress";
import { IceDropzone, StyledImage } from "./styles";

interface Props {
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  setRows: React.Dispatch<React.SetStateAction<ExifRow[]>>;
}

export default function ImgDropzone({ setFile, setRows }: Props) {
  // 썸네일
  const [thumbnail, setThumbnail] = useState("");

  /*** 클릭 & 드롭 이벤트 */
  const onDrop = async (acceptedFiles: File[]) => {
    const inputImage = acceptedFiles[0];
    setThumbnail(URL.createObjectURL(inputImage)); // 썸네일
    const binaryData = await inputImage.arrayBuffer();
    let input_data = new Uint8Array(binaryData);
    const result = await window.goFunc(input_data);

    setFile(inputImage);
    if (!result) {
      setRows([]);
      return;
    }

    const meta: [
      {
        tag: string;
        comment: string;
        data: string;
        origindata: string;
        type: string;
        name: string;
        unit: string;
        example: any;
      }
    ] = JSON.parse(result);

    setRows(
      await Promise.all(
        meta.map(
          async (
            { tag, comment, data, origindata, name, type, unit, example },
            index
          ) => {
            if (tag === "Location") {
              // 좌표(위도, 경도) 데이터 가 있는 경우
              try {
                const address = await getAddress(
                  origindata.split(",")[0].trim(),
                  origindata.split(",")[1].trim()
                );
                // 주소 설정
                data = address;
              } catch (error_msg) {
                console.log(error_msg);
              }
            }
            return {
              id: index + 1,
              meta: tag,
              comment: comment,
              data: data,
              origindata: origindata,
              name: name,
              type: type,
              unit: unit,
              example,
            };
          }
        )
      )
    );
  };

  // 허용 가능한 포맷
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  // const stopPropagation = useCallback((event: any) => {
  //   event.stopPropagation();
  // }, []);

  return (
    <>
      <IceDropzone {...getRootProps()}>
        {thumbnail ? (
          <StyledImage
            src={thumbnail}
            // onClick={stopPropagation}
            preview={false}
          />
        ) : (
          <div>
            {isDragActive ? (
              <span>Drop</span>
            ) : (
              <div>
                <Logo />
                <div>클릭하거나 사진을 드롭하세요!</div>
                <br />
                <div>(현재 테스용 Demo 페이지 입니다)</div>
                <div>문의 : dbzoseh84@gmail.com</div>
              </div>
            )}
          </div>
        )}
        <input {...getInputProps()} />
      </IceDropzone>
    </>
  );
}
