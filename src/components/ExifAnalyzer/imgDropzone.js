/* global kakao */
import React, { useCallback, useState }  from 'react';
import { useDropzone } from 'react-dropzone';
import IceExif from './wasm/ice_exif.js'

// Bootstrap
import Figure from 'react-bootstrap/Figure';

// Icon
import { Instagram } from 'react-bootstrap-icons';

// Wasm 파일 연결
const IceExifPromise = IceExif({
	noInitialRun: true,
	noExitRuntime: true
})

// 주소 얻기
const getAddress = (lat, lng) => {
  return new Promise((resolve, reject) => {
      let geocoder = new kakao.maps.services.Geocoder();
      let coord = new kakao.maps.LatLng(lat, lng);
      let callback = function(result, status) {
          if (status === kakao.maps.services.Status.OK) {
              let res = result[0].address.address_name;
              resolve(res);
          } else {
              reject(status);
          }
      }
      geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
  });
};

// 날짜 출력 형식 설정
function convertDateFormat(date) {
  return date.toLocaleDateString().replace(/\./g, '').split(' ').map((v,i)=> i > 0 && v.length < 2 ? '0' + v : v).join('-') + " " + date.toTimeString().split(" ")[0];
}
// 날짜 출력 형식 설정2
function convertDateFormat2(date_str) {
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
function ImgDropzone(props) {
  const [thumbnail, setThumbnail] = useState("");


  const onChangeImg = async (file) => {
      let exifData = {
        // 이미지 정보
        "exif_file": "",   // 원본 파일
        "exif_filename": "",    // 파일명
        "exif_software": "",    // 소프트웨어
        "exif_width": "",   // 너비
        "exif_height": "",  // 높이
        "exif_orientation": "", // 회전
        "exif_bit_per_sample": "",  // 샘플당 비트 수
        "exif_copyright": "",   // 저작권
        "exif_description": "", // 주석
        // 시간 정보
        "exif_last_modified_datetime": "",   // 마지막 수정 시간
        "exif_datetime": "",    // 편집 날짜
        "exif_original_datetime": "",   // 촬영 날짜
        "exif_digitize_datetime": "",   // 디지털화 날짜
        "exif_subsecond_time": "",  // 초 단위
        // 위치 정보
        "exif_gps_address": "",     // 주소
        "exif_gps_latitude": "",    // 위도
        "exif_gps_longitude": "",   // 경도
        "exif_gps_altitude": "",    // 고도
        "exif_gps_dop": "",         // 척도
        // 카메라 정보
        "exif_make": "",    // 제조사
        "exif_carmera_model": "",   // 모델 
        "exif_subject_distance": "",    // 피사체 거리
        "exif_exposure_time": "",   // 노출 시간
        "exif_exposure_program": "",    // 노출 프로그램
        "exif_iso_speed": "",   // 감광 속도
        "exif_exposure_bias": "",   // 노출 보정
        "exif_metering_mode": "",   // 측광 모드
        "exif_flash": "",   // 플래시
        "exif_flash_returned_light": "",    // 역광
        "exif_flash_mode": "",  // 플래시 모드
        // 렌즈 정보
        "exif_lens_make": "",   // 제조사
        "exif_lens_model": "",  // 모델
        "exif_focal_length": "",    // 초점
        "exif_focal_length_in35mm": "", // 35mm에서 초점
        "exif_focal_length_min": "",    // 최소 초점
        "exif_focal_length_max": "",    // 최대 초점
        "exif_fstop": "",   //조리개 개폐 정도
        "exif_fstop_min": "",   // 조리개 최소 걔페
        "exif_fstop_max": "",   // 조리개 최대 개폐
        "exif_focal_plane_xres": "",    // 초점 x
        "exif_focal_plane_yres": "",    // 초점 y
    }

    // Wasm 파일 없이 얻을 수 있는 정보(썸네일, 원본, 파일 이름, 마지막 수정 시간)
    setThumbnail(URL.createObjectURL(file[0])); // 썸네일

    exifData["exif_file"] = file[0]; // 원본 파일
    exifData["exif_filename"] = file[0].name; // 파일이름
    exifData["exif_last_modified_datetime"] = convertDateFormat(file[0].lastModifiedDate); // 마지막 수정시간

    // 데이터 버퍼 얻기 (Wasm 파일에서 사용)
    file[0].arrayBuffer().then(
      data => {
        // Wasm 파일 이용 EXIF 메타 데이터 분석
        IceExifPromise.then ( mod => {
          // 데이터 복사 과정(Wasm에 직접적으로 보내지 않고 브라우저의 힙영역 이용)
          let file_size = file[0].size;
          let offset = mod._malloc(file_size);
          let dataHeap = new Uint8Array(mod.HEAPU8.buffer, offset, file_size);
          let data_list = new Uint8Array(data);
          dataHeap.set(data_list);
          // Wasm으로 만든 함수 실행
          let res_val = mod._ice_exif_parser(offset, file_size);
          // 결과 값이 정상일경우
          if(res_val == 0) {
            exifData = Object.assign({}, exifData, mod.exif_result);
            // 날짜 형식 변경
            exifData["exif_datetime"] = convertDateFormat2(exifData["exif_datetime"]);
            exifData["exif_original_datetime"] = convertDateFormat2(exifData["exif_original_datetime"]);
            exifData["exif_digitize_datetime"] = convertDateFormat2(exifData["exif_digitize_datetime"]);
            // 주소 변경하기
            if (exifData["exif_gps_latitude"] && exifData["exif_gps_latitude"]) { // 주소 데이터 가 있는 경우
              getAddress(exifData["exif_gps_latitude"], exifData["exif_gps_longitude"]).then(address => {
                  exifData["exif_gps_address"] = address;
                  props.setExifData(exifData); // 최종 전송
              }).catch(err => {
                  props.setExifData(exifData); // 최종 전송
              })
            } else {
            props.setExifData(exifData); // 최종 전송
          }} else {
            props.setExifData(exifData); // 최종 전송
          }
        });
      }
    )
  }

  // 이미지를 드롭 했을때 실행할 함수
  const onDrop = useCallback(acceptedFiles => {
        onChangeImg(acceptedFiles);
  }, []);

  // 허용 가능한 포맷
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop, accept: {
    'image/jpeg': [],
    'image/png': []}});

  return (
    <div className="rounded bg-secondary text-white d-flex justify-content-center align-items-center p-3"
    style={{
      cursor: "pointer",
      minHeight: "100px",
      border: "0px dashed white",
      borderRadius:"25px"
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
            <div>
              {
                isDragActive ?
                  <span>Drop <Instagram/></span> :
                  <div>Click or Drop <Instagram/></div>
              }
            </div>
          </div>
      }
    </div>
  );
}

export default ImgDropzone;
