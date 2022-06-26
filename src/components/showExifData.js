import React, { useState, useEffect } from "react";
import Kakaomap from "./kakaomap";

// Bootstrap
import { Table } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { FileEarmarkImage, FileEarmarkExcelFill, CameraFill, ClockFill, GeoAltFill } from 'react-bootstrap-icons';

// EXIF 데이터 정보 보여주는 컴포넌트
function ShowExifData(props) {
    const [ location, setLocation ] = useState(); // 위치 주소
    useEffect(() => { setLocation(); }, [props.exifData]);
    // EXIF 데이터가 없는 경우
    if(!props.exifData['EXIF']){
        return (
            <div className="bg-dark text-white h-100 rounded">
                <div className="align-middle p-5">
                    <h3><FileEarmarkExcelFill/></h3>
                    <span>사진에 EXIF 정보가 없습니다.</span>
                </div>
            </div>
        )
    }
    else {
        return (
            <Card className="bg-dark text-white border-1 rounded" style={{ width: '100%' }}>
                    { props.exifData["GPSInfo"] &&
                            <Kakaomap exifData={ props.exifData } setLocation={ setLocation }/>
                    }
                <Card.Body className="p-2 bg-light">
                <Table hover size="sm" variant="light" className="mb-0 p-0 text-start">
                    <tbody>
                        <tr>
                            <td><GeoAltFill/> 위치</td>
                            <td>{ location &&
                                <span> {location.road_address ? location.road_address.address_name : location.address.address_name}<br/></span>
                                }
                                { props.exifData["GPSInfo"] &&
                                <span> ({props.exifData["GPSInfo"][0]}, {props.exifData["GPSInfo"][1]})</span>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td><CameraFill/> 제조사</td>
                            <td>{props.exifData['Make']}</td>
                        </tr>
                        <tr>
                            <td><CameraFill/> 모델</td>
                            <td>{props.exifData['Model']}</td>
                        </tr>
                        <tr>
                            <td><CameraFill/> 플래시정보</td>
                            <td>{props.exifData['Flash']}</td>
                        </tr>
                        <tr>
                            <td><CameraFill/> 프로그램</td>
                            <td>{props.exifData['Software']}</td>
                        </tr>
                        <tr>
                            <td><ClockFill/> 시간</td>
                            <td>{props.exifData['DateTime']}</td>
                        </tr>
                        <tr>
                            <td><ClockFill/> 원본촬영시간</td>
                            <td>{props.exifData['DateTimeOriginal']}</td>
                        </tr>
                        <tr>
                            <td><ClockFill/> 디지털화된시간</td>
                            <td>{props.exifData['DateTimeDigitized']}</td>
                        </tr>
                        <tr>
                            <td><FileEarmarkImage/> 크기</td>
                            <td>{props.exifData['ImageWidth']}(너비), {props.exifData['ImageLength']}(높이)</td>
                        </tr>
                        <tr>
                            <td><FileEarmarkImage/> ID</td>
                            <td>{props.exifData['ImageUniqueID']}</td>
                        </tr>
                        <tr>
                            <td><FileEarmarkImage/> EXIF 버전</td>
                            <td>{props.exifData['ExifVersion']}</td>
                        </tr>
                    </tbody>
                </Table>
                </Card.Body>
            </Card>
        )
    }
  }

export default ShowExifData;