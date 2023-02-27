import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Exifdata {
  exif_file?: any,   // 원본 파일
  exif_filename: string,    // 파일명
  exif_software: string,    // 소프트웨어
  exif_width: string,   // 너비
  exif_height: string,  // 높이
  exif_orientation: string, // 회전
  exif_bit_per_sample: string,  // 샘플당 비트 수
  exif_copyright: string,   // 저작권
  exif_description: string, // 주석
  // 시간 정보
  exif_last_modified_datetime: string,   // 마지막 수정 시간
  exif_datetime: string,    // 편집 날짜
  exif_original_datetime: string,   // 촬영 날짜
  exif_digitize_datetime: string,   // 디지털화 날짜
  exif_subsecond_time: string,  // 초 단위
  // 위치 정보
  exif_gps_address: string,     // 주소
  exif_gps_latitude: string,    // 위도
  exif_gps_longitude: string,   // 경도
  exif_gps_altitude: string,    // 고도
  exif_gps_dop: string,         // 척도
  // 카메라 정보
  exif_make: string,    // 제조사
  exif_carmera_model: string,   // 모델 
  exif_subject_distance: string,    // 피사체 거리
  exif_exposure_time: string,   // 노출 시간
  exif_exposure_program: string,    // 노출 프로그램
  exif_iso_speed: string,   // 감광 속도
  exif_exposure_bias: string,   // 노출 보정
  exif_metering_mode: string,   // 측광 모드
  exif_flash: string,   // 플래시
  exif_flash_returned_light: string,    // 역광
  exif_flash_mode: string,  // 플래시 모드
  // 렌즈 정보
  exif_lens_make: string,   // 제조사
  exif_lens_model: string,  // 모델
  exif_focal_length: string,    // 초점
  exif_focal_length_in35mm: string, // 35mm에서 초점
  exif_focal_length_min: string,    // 최소 초점
  exif_focal_length_max: string,    // 최대 초점
  exif_fstop: string,   //조리개 개폐 정도
  exif_fstop_min: string,   // 조리개 최소 걔페
  exif_fstop_max: string,   // 조리개 최대 개폐
  exif_focal_plane_xres: string,    // 초점 x
  exif_focal_plane_yres: string,    // 초점 y
}

export const initialStateExifdata: Exifdata = {
  // exif_file: "",
  exif_filename: "",  
  exif_software: "",  
  exif_width: "", 
  exif_height: "",
  exif_orientation: "",
  exif_bit_per_sample: "",
  exif_copyright: "", 
  exif_description: "",
  exif_last_modified_datetime: "", 
  exif_datetime: "",  
  exif_original_datetime: "", 
  exif_digitize_datetime: "", 
  exif_subsecond_time: "",
  exif_gps_address: "",   
  exif_gps_latitude: "",  
  exif_gps_longitude: "", 
  exif_gps_altitude: "",  
  exif_gps_dop: "",       
  exif_make: "",  
  exif_carmera_model: "", 
  exif_subject_distance: "",  
  exif_exposure_time: "", 
  exif_exposure_program: "",  
  exif_iso_speed: "", 
  exif_exposure_bias: "", 
  exif_metering_mode: "", 
  exif_flash: "", 
  exif_flash_returned_light: "",  
  exif_flash_mode: "",
  exif_lens_make: "", 
  exif_lens_model: "",
  exif_focal_length: "",  
  exif_focal_length_in35mm: "",
  exif_focal_length_min: "",  
  exif_focal_length_max: "",  
  exif_fstop: "",
  exif_fstop_min: "", 
  exif_fstop_max: "", 
  exif_focal_plane_xres: "",  
  exif_focal_plane_yres: "",  
}

export const exifdataSlice = createSlice({
  name: "exifdata",
  initialState: initialStateExifdata,
  reducers: {
    setExifdata(state, action: PayloadAction<Exifdata>) {
      state = { ...state, ...action.payload }
      return state
    },
  },
});

export const exifdataActions = exifdataSlice.actions;

export default exifdataSlice;
