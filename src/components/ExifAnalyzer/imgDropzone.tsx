/* global kakao */
import { useCallback, useState }  from 'react';
import { useDropzone } from 'react-dropzone';
import useExifdata from "hooks/useExifdata";
import IceExif from 'wasm/ice_exif.js'

// Bootstrap
import Figure from 'react-bootstrap/Figure';


/* WASM */
// Wasm 파일 연결
const IceExifPromise = IceExif({
	noInitialRun: true,
	noExitRuntime: true
});


/* Kakao Map */
declare var kakao: any;

// 주소 얻기
const getAddress = (lat: string , lng: string): Promise<string> => {
  return new Promise((resolve, reject) => {
      let geocoder = new kakao.maps.services.Geocoder();
      let coord = new kakao.maps.LatLng(lat, lng);
      let callback = function(result: any, status: any) {
          if (status === kakao.maps.services.Status.OK) {
              let res = result[0].address.address_name;
              resolve(res);
          } else {
              reject(status);
          }
      }
      geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
  });
}


/* Date */
// 날짜 출력 형식 설정
function convertDateFormat(date: Date): string {
  return date.toLocaleDateString().replace(/\./g, '').split(' ').map((v,i)=> i > 0 && v.length < 2 ? '0' + v : v).join('-') + " " + date.toTimeString().split(" ")[0];
}

// 날짜 출력 형식 설정2
function convertDateFormat2(date_str: string): string {
  try {
    if(date_str.split(" ").length > 1)
      return date_str.split(" ")[0].replaceAll(":", "-") + " " + date_str.split(" ")[1];
    else
      return date_str;
  }
  catch {
    return date_str;
  }
}



// 이미지 드롭존 컴포넌트
function ImgDropzone() {
  // 썸네일
  const [thumbnail, setThumbnail] = useState("");
  // Exif 설정
  const {initExifdata, setExifdata} = useExifdata();
  // 메타데이터 최대 크기
  // const MAX_SIZE = 65536;

  // 이미지 변경 훅
  const onChangeImg = async (file: any) => {
    let exifData = {...initExifdata};
    // Wasm 파일 없이 얻을 수 있는 정보(썸네일, 원본, 파일 이름, 마지막 수정 시간)
    setThumbnail(URL.createObjectURL(file)); // 썸네일

    // exifData["exif_file"] = file; // 원본 파일
    exifData["exif_filename"] = file.name; // 파일이름
    exifData["exif_last_modified_datetime"] = convertDateFormat(file.lastModifiedDate); // 마지막 수정시간
    exifData["exif_filesize"] = file.size?.toString();
    let file_size = file.size;

    // 데이터 버퍼 얻기 (Wasm 파일에서 사용)
    file.arrayBuffer().then(
      (data: ArrayBuffer)  => {
        // Wasm 파일 이용 EXIF 메타 데이터 분석
        IceExifPromise.then((mod: any) => {
          // 데이터 복사 과정(Wasm에 직접적으로 보내지 않고 브라우저의 힙영역 이용)
          let offset = mod._malloc(file_size);
          let dataHeap = new Uint8Array(mod.HEAPU8.buffer, offset, file_size);
          let data_list = new Uint8Array(data);
          // console.log(`File Size : ${file_size}, Original File Size : ${data_list.length}, Edit File Size : ${data_list.slice(0, file_size).length}`);
          // console.log(`Offset : ${offset}`);
          // dataHeap.set(data_list.slice(0, file_size));
          dataHeap.set(data_list);
          // Wasm으로 만든 함수 실행
          let res_val = mod._ice_exif_parser(offset, file_size);

          // console.log(res_val);

          // 결과 값이 정상일경우
          if(res_val === 0) {
            // 결과 적용
            exifData = {...exifData, ...mod.exif_result}
            
            // 날짜 형식 변경
            exifData["exif_datetime"] = convertDateFormat2(exifData["exif_datetime"]);
            exifData["exif_original_datetime"] = convertDateFormat2(exifData["exif_original_datetime"]);
            exifData["exif_digitize_datetime"] = convertDateFormat2(exifData["exif_digitize_datetime"]);

            // 주소 얻기
            if(exifData["exif_gps_latitude"] && exifData["exif_gps_latitude"]) { // 좌표(위도, 경도) 데이터 가 있는 경우
              getAddress(exifData["exif_gps_latitude"], exifData["exif_gps_longitude"]).then(address => {
                // 주소 설정
                exifData["exif_gps_address"] = address;
              }).catch(error_msg => {
                console.log(error_msg);
              }).finally(() => {
                // EXifdata 설정
                setExifdata(exifData);
              })
            }
          }
          // EXifdata 설정
          setExifdata(exifData);
        });
      }
    );
  }

  // 이미지를 드롭 했을때 실행할 함수
  const onDrop = useCallback(<T extends File>(acceptedFiles: T[]) => {
        if(acceptedFiles[0]) { // 이미지 파일만 있는 경우, 2개 이상인경우 첫번째 이미지 선택
          onChangeImg(acceptedFiles[0]);
        }
  }, []);

  // 허용 가능한 포맷
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop, accept: {
    'image/jpeg': [],
    'image/png': []}
  });

  return (
    <div className="rounded text-white d-flex justify-content-center align-items-center p-3"
    style={{
      cursor: "pointer",
      minHeight: "100px",
      backgroundImage:"url('frozen3.png')",
      backgroundSize: "cover",
      // border: "0px dashed white",
      borderRadius:"25px",
      fontWeight:"600",
      textShadow: "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black"
    }}
    {...getRootProps()}>
      <input {...getInputProps()} />
      {
          thumbnail ?
          <Figure.Image
              className='border'
              width={200}
              height={200}
              src={thumbnail}
          />
          :
          <div>
              {
                isDragActive ?
                  <span>Drop</span> :
                  <div>Click or Drop Here!</div>
              }
          </div>
      }
    </div>
  );
}

export default ImgDropzone;
