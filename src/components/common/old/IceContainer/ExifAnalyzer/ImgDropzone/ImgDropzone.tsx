import Logo from 'components/common/old/Logo/Logo';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ExifRow } from 'types';
import { getAddress, isValidLocation } from 'utils/getAddress';
import { IceDropzone, StyledImage } from './styles';

interface Props {
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  setRows: React.Dispatch<React.SetStateAction<ExifRow[]>>;
}

export default function ImgDropzone({ setFile, setRows }: Props) {
  // 썸네일
  const [thumbnail, setThumbnail] = useState('');

  /*** 클릭 & 드롭 이벤트 */
  const onDrop = async (acceptedFiles: File[]) => {
    // 0번째만 읽기
    const inputImage = acceptedFiles[0];
    // 썸네일용 URL 생성
    setThumbnail(URL.createObjectURL(inputImage)); // 썸네일

    // 바이너리 데이터 얻기
    const binaryData = await inputImage.arrayBuffer();
    let input_data = new Uint8Array(binaryData);
    // GO 웹 어셈블리 모듈에 입력
    const result = await window.goFunc(input_data);

    // 원본 파일 저장
    setFile(inputImage);

    // 결과가 없는 경우
    if (!result) {
      setRows([]);
      return;
    }

    // 메타 데이터 파싱
    const meta: [
      {
        tag: string; // 영문 태그명
        comment: string; // 주석
        data: string; // 데이터
        origindata: string; // 원본 데이터
        type: string; // 타입
        name: string; // 한글 태그명
        unit: string; // 단위
        example: any; // 예제값
      },
    ] = JSON.parse(result);

    setRows(
      await Promise.all(
        meta.map(
          async (
            { tag, comment, data, origindata, name, type, unit, example },
            index
          ) => {
            if (tag === 'Location') {
              // 좌표(위도, 경도) 데이터 가 있는 경우
              try {
                const [lat, lng] = origindata
                  .split(',')
                  .map((value) => value.trim());
                if (isValidLocation(lat, lng)) {
                  // API로 주소값 얻기
                  const address = await getAddress(lat, lng);
                  // 주소값으로 변경
                  data = address;
                }
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
      'image/jpeg': [],
      'image/png': [],
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
            <Logo />
            <br />
            {isDragActive ? (
              <div>여기에 드롭 해주세요!</div>
            ) : (
              <div>이곳을 클릭 또는 여기에 이미지를 드롭 하세요!</div>
            )}
          </div>
        )}
        <input {...getInputProps()} />
      </IceDropzone>
    </>
  );
}
