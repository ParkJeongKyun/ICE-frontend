import React, { useState } from 'react';

// Icon
import { Image, Smartwatch, GeoAltFill, Instagram, Fan } from 'react-bootstrap-icons';

// Component
import ImgDropzone from "./imgDropzone";
import Kakaomap from "./kakaomap";

// Style
import "../../styles/dashboard.css";


// 이미지 EXIF 분석기 메인 컴포넌트
function AppExifAnalyzer() {
    const [exifData, setExifData] = useState({
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
    });

    return (
        <Deshbord exifData={exifData} setExifData={setExifData}/>
    );
}

// 세부 정보
function Show_info(props) {
    return (
        <div className="d-flex mt-4 align-items-center justify-content-between">
            <div>
                <h6 className="mb-0" style={{fontWeight:"400"}}>
                { props.value ?
                    props.value : "-"        
                }
                </h6>
                <p className="m-0" style={{fontSize:"0.75em"}}>{props.name}</p>
            </div>
            <div>
                <h6 className="mb-0" style={{fontWeight:"400"}}>
                    {props.unit}
                </h6>  
            </div>         
        </div>
    );
}

// 대시 보드
function Deshbord(props) {
    const exifData = props.exifData;

    return (
        <div className="dashboard d-flex w-100">
            <div style={{flex:"1 1 auto", display:"flex", flexFlow:"column", height:"100%", overflowY:"hidden"}}>
                <div style={{height:"100%"}}>
                    <div className="d-flex card-section">
                        <div className="cards-container">

                            <div className="card-bg w-100 border d-flex flex-column p-4" style={{gridRow:"span 2"}}>
                                <div className="p-0 pb-3 text-center">
                                    <ImgDropzone setExifData={props.setExifData}/>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <h6  className="h5 font-weight-bold text-dark">이미지 정보</h6>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Image/></div>
                                </div>
                                <Show_info value={exifData.exif_filename} name="파일명"/>
                                <Show_info value={exifData.exif_software} name="소프트웨어"/>
                                <Show_info value={exifData.exif_width} name="너비"/>
                                <Show_info value={exifData.exif_height} name="높이"/>
                                <Show_info value={exifData.exif_orientation} name="회전"/>
                                <Show_info value={exifData.exif_bit_per_sample} name="샘플당 비트 수"/>
                                <Show_info value={exifData.exif_copyright} name="저작권"/>
                                <Show_info value={exifData.exif_description} name="주석"/>
                            </div>


                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="m-0 h5 font-weight-bold text-dark">시간정보</h4>
                                        <div className="py-1 px-2 bg-grey rounded-circle"><Smartwatch/></div>
                                    </div>
                                    <Show_info value={exifData.exif_last_modified_datetime} name="마지막 수정 시간"/>
                                    <Show_info value={exifData.exif_datetime} name="편집 날짜"/>
                                    <Show_info value={exifData.exif_original_datetime} name="촬영 날짜"/>
                                    <Show_info value={exifData.exif_digitize_datetime} name="디지털화 날짜"/>
                                    <Show_info value={exifData.exif_subsecond_time} name="초 단위"/>
                                </div>
                            </div>


                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="m-0 h5 font-weight-bold text-dark">위치정보</h4>
                                        <div className="py-1 px-2 bg-grey rounded-circle"><GeoAltFill/></div>
                                    </div>
                                    {
                                    exifData.exif_gps_address &&
                                        <Kakaomap gps_info={[exifData.exif_gps_latitude, exifData.exif_gps_longitude]}/>
                                    }
                                    <Show_info value={exifData.exif_gps_address} name="주소"/>
                                    <Show_info value={exifData.exif_gps_latitude} name="위도" unit="deg"/>
                                    <Show_info value={exifData.exif_gps_longitude} name="경도" unit="deg"/>
                                    <Show_info value={exifData.exif_gps_altitude} name="고도" unit="m"/>
                                    <Show_info value={exifData.exif_gps_dop} name="척도"/>
                                </div>
                            </div>


                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="m-0 h5 font-weight-bold text-dark">카메라정보</h4>
                                        <div className="py-1 px-2 bg-grey rounded-circle"><Instagram/></div>
                                    </div>
                                    <Show_info value={exifData.exif_make} name="제조사"/>
                                    <Show_info value={exifData.exif_carmera_model} name="모델"/>
                                    <Show_info value={exifData.exif_subject_distance} name="피사체 거리" unit="m"/>
                                    <Show_info value={exifData.exif_exposure_time} name="노출 시간" unit="1/0 s"/>
                                    <Show_info value={exifData.exif_exposure_program} name="노출 프로그램"/>
                                    <Show_info value={exifData.exif_iso_speed} name="감광 속도"/>
                                    <Show_info value={exifData.exif_exposure_bias} name="노출 보정" unit="EV"/>
                                    <Show_info value={exifData.exif_metering_mode} name="측광 모드"/>
                                    <Show_info value={exifData.exif_flash} name="플래시"/>
                                    <Show_info value={exifData.exif_flash_returned_light} name="역광"/>
                                    <Show_info value={exifData.exif_flash_mode} name="플래시 모드"/>
                                </div>
                            </div>
                            

                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="m-0 h5 font-weight-bold text-dark">렌즈정보</h4>
                                        <div className="py-1 px-2 bg-grey rounded-circle"><Fan/></div>
                                    </div>
                                    <Show_info value={exifData.exif_lens_make} name="제조사"/>
                                    <Show_info value={exifData.exif_lens_model} name="모델"/>
                                    <Show_info value={exifData.exif_focal_length} name="초점" unit="mm"/>
                                    <Show_info value={exifData.exif_focal_length_in35mm} name="35mm에서 초점" unit="mm"/>
                                    <Show_info value={exifData.exif_focal_length_min} name="최소 초점" unit="mm"/>
                                    <Show_info value={exifData.exif_focal_length_max} name="최대 초점" unit="mm"/>
                                    <Show_info value={exifData.exif_fstop} name="조리개 개폐 정도" unit="f/8.0"/>
                                    <Show_info value={exifData.exif_fstop_min} name="조리개 최소 개폐" unit="f/0.0"/>
                                    <Show_info value={exifData.exif_fstop_max} name="조리개 최대 개폐" unit="f/0.0"/>
                                    <Show_info value={exifData.exif_focal_plane_xres} name="초점 x"/>
                                    <Show_info value={exifData.exif_focal_plane_yres} name="초점 y"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppExifAnalyzer;