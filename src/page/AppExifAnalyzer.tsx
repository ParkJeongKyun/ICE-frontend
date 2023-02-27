import { useState } from 'react';
import useExifdata from "hooks/useExifdata";
import ShowInfo from 'components/ExifAnalyzer/showExifdata';

// Icon
import { Image, Smartwatch, GeoAltFill, Instagram, Fan } from 'react-bootstrap-icons';

// Component
import ImgDropzone from "components/ExifAnalyzer/imgDropzone";
import Kakaomap from "components/ExifAnalyzer/kakaomap";

// Style
import "styles/dashboard.css";

// 이미지 EXIF 분석기 메인 컴포넌트
function AppExifAnalyzer() {
    const { exifdata } = useExifdata();

    return (
        <div className="dashboard d-flex w-100">
        <div style={{flex:"1 1 auto", display:"flex", flexFlow:"column", height:"100%", overflowY:"hidden"}}>
            <div style={{height:"100%"}}>
                <div className="d-flex card-section">
                    <div className="cards-container">

                        <div className="card-bg w-100 border d-flex flex-column p-4" style={{gridRow:"span 2"}}>
                            <div className="p-0 pb-3 text-center">
                                <ImgDropzone/>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <h6  className="h5 font-weight-bold text-dark">이미지 정보</h6>
                                <div className="py-1 px-2 bg-grey rounded-circle"><Image/></div>
                            </div>
                            <ShowInfo value={exifdata.exif_filename} name="파일명"/>
                            <ShowInfo value={exifdata.exif_software} name="소프트웨어"/>
                            <ShowInfo value={exifdata.exif_width} name="너비"/>
                            <ShowInfo value={exifdata.exif_height} name="높이"/>
                            <ShowInfo value={exifdata.exif_orientation} name="회전"/>
                            <ShowInfo value={exifdata.exif_bit_per_sample} name="샘플당 비트 수"/>
                            <ShowInfo value={exifdata.exif_copyright} name="저작권"/>
                            <ShowInfo value={exifdata.exif_description} name="주석"/>
                        </div>


                        <div className="card-bg w-100 border d-flex flex-column">
                            <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">시간정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Smartwatch/></div>
                                </div>
                                <ShowInfo value={exifdata.exif_last_modified_datetime} name="마지막 수정 시간"/>
                                <ShowInfo value={exifdata.exif_datetime} name="편집 날짜"/>
                                <ShowInfo value={exifdata.exif_original_datetime} name="촬영 날짜"/>
                                <ShowInfo value={exifdata.exif_digitize_datetime} name="디지털화 날짜"/>
                                <ShowInfo value={exifdata.exif_subsecond_time} name="초 단위"/>
                            </div>
                        </div>


                        <div className="card-bg w-100 border d-flex flex-column">
                            <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">위치정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><GeoAltFill/></div>
                                </div>
                                {
                                exifdata.exif_gps_address &&
                                    <Kakaomap latitude={exifdata.exif_gps_latitude} longitude={exifdata.exif_gps_longitude}/>
                                }
                                <ShowInfo value={exifdata.exif_gps_address} name="주소"/>
                                <ShowInfo value={exifdata.exif_gps_latitude} name="위도" unit="deg"/>
                                <ShowInfo value={exifdata.exif_gps_longitude} name="경도" unit="deg"/>
                                <ShowInfo value={exifdata.exif_gps_altitude} name="고도" unit="m"/>
                                <ShowInfo value={exifdata.exif_gps_dop} name="척도"/>
                            </div>
                        </div>


                        <div className="card-bg w-100 border d-flex flex-column">
                            <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">카메라정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Instagram/></div>
                                </div>
                                <ShowInfo value={exifdata.exif_make} name="제조사"/>
                                <ShowInfo value={exifdata.exif_carmera_model} name="모델"/>
                                <ShowInfo value={exifdata.exif_subject_distance} name="피사체 거리" unit="m"/>
                                <ShowInfo value={exifdata.exif_exposure_time} name="노출 시간" unit="1/0 s"/>
                                <ShowInfo value={exifdata.exif_exposure_program} name="노출 프로그램"/>
                                <ShowInfo value={exifdata.exif_iso_speed} name="감광 속도"/>
                                <ShowInfo value={exifdata.exif_exposure_bias} name="노출 보정" unit="EV"/>
                                <ShowInfo value={exifdata.exif_metering_mode} name="측광 모드"/>
                                <ShowInfo value={exifdata.exif_flash} name="플래시"/>
                                <ShowInfo value={exifdata.exif_flash_returned_light} name="역광"/>
                                <ShowInfo value={exifdata.exif_flash_mode} name="플래시 모드"/>
                            </div>
                        </div>
                        

                        <div className="card-bg w-100 border d-flex flex-column">
                            <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">렌즈정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Fan/></div>
                                </div>
                                <ShowInfo value={exifdata.exif_lens_make} name="제조사"/>
                                <ShowInfo value={exifdata.exif_lens_model} name="모델"/>
                                <ShowInfo value={exifdata.exif_focal_length} name="초점" unit="mm"/>
                                <ShowInfo value={exifdata.exif_focal_length_in35mm} name="35mm에서 초점" unit="mm"/>
                                <ShowInfo value={exifdata.exif_focal_length_min} name="최소 초점" unit="mm"/>
                                <ShowInfo value={exifdata.exif_focal_length_max} name="최대 초점" unit="mm"/>
                                <ShowInfo value={exifdata.exif_fstop} name="조리개 개폐 정도" unit="f/8.0"/>
                                <ShowInfo value={exifdata.exif_fstop_min} name="조리개 최소 개폐" unit="f/0.0"/>
                                <ShowInfo value={exifdata.exif_fstop_max} name="조리개 최대 개폐" unit="f/0.0"/>
                                <ShowInfo value={exifdata.exif_focal_plane_xres} name="초점 x"/>
                                <ShowInfo value={exifdata.exif_focal_plane_yres} name="초점 y"/>
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