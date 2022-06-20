import React, { useState, useEffect } from "react";
import Kakaomap from "./kakaomap";

// Bootstrap
import { Table } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { FileEarmarkExcelFill, XLg } from 'react-bootstrap-icons';

function ShowExifData(props) {
    const [ location, setLocation] = useState();
    useEffect(() => { setLocation(); }, [props.exifData]);

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
                <Card.Body className="p-0">
                <Table hover size="sm" variant="light" className="mb-0 p-0">
                    <tbody>
                        <tr>
                            <td>위치정보</td>
                            <td>{ location &&
                            <span> {location.road_address ? location.road_address.address_name : location.address.address_name}</span>
                            }</td>
                        </tr>
                        <tr>
                            <td>카메라 제조사</td>
                            <td>{props.exifData['Make']}</td>
                        </tr>
                        <tr>
                            <td>카메라 모델</td>
                            <td>{props.exifData['Model']}</td>
                        </tr>
                        <tr>
                            <td>프로그램</td>
                            <td>{props.exifData['Software']}</td>
                        </tr>
                        <tr>
                            <td>시간</td>
                            <td>{props.exifData['DateTime']}</td>
                        </tr>
                        <tr>
                            <td>원본촬영시간</td>
                            <td>{props.exifData['DateTimeOriginal']}</td>
                        </tr>
                        <tr>
                            <td>디지털화된시간</td>
                            <td>{props.exifData['DateTimeDigitized']}</td>
                        </tr>
                        <tr>
                            <td>사진 크기</td>
                            <td>{props.exifData['ImageWidth']}(너비), {props.exifData['ImageLength']}(높이)</td>
                        </tr>
                        <tr>
                            <td>카메라 플래시 정보</td>
                            <td>{props.exifData['Flash']}</td>
                        </tr>
                        <tr>
                            <td>이미지ID</td>
                            <td>{props.exifData['ImageUniqueID']}</td>
                        </tr>
                        <tr>
                            <td>EXIF버전</td>
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