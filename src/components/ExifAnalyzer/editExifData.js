import React, { useState, useCallback, useEffect } from "react";
import axios from 'axios';
import { KakaomapSearCh } from "./kakaomap";

//Bootstrap
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Figure from 'react-bootstrap/Figure';
import Card from 'react-bootstrap/Card';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Table, Form } from 'react-bootstrap';
import { FileEarmarkImage, CameraFill, ClockFill, GeoAltFill, Trash3Fill } from 'react-bootstrap-icons';

// EXIF 데이터를 사용가가 수정할 수 있게하는 컴포넌트
function EditExifData(props) {
    const [ editedImg, setEditedImg ] = useState(null);   // EXIF 수정된 이미지
    const [ inputs, setInputs ] = useState([]); // 수정할 EXIF 데이터 리스트들
    const [ showSearchMap, setShowSearchMap ] = useState(false); // 위치 찾기 ON/OFF
    const [ loading, setLoading ] = useState(false); // 로딩 여부

    useEffect(() => { // 첫마운트시 원본 EXIF값과 사용자 입력값 동기화
        let tmp= {...props.exifData};
        delete tmp['EXIF'];
        setInputs(tmp);
    }, [props.exifData]);
    // 인풋 컨트롤
    const onChangeInputs = useCallback( e => {
        const { value, name } = e.target;
        if(!name.includes("Time")){
            if(name.includes("Flash")){ // 플래시 정수만 가능
                if(e.target.value > 15){ // 15보다 큰경우
                    e.target.value = 15;
                } else if(e.target.value < -1){ // -1 보다 작은 경우
                    e.target.value = -1;
                }
            } else {
                e.target.value = e.target.value.replace(/[^A-Za-z0-9]/ig, ''); // 영어, 숫자만 입력 가능
            }
        }
        let val = value;
        // 날짜 포맷 수정
        if(name.includes("Time")){ if(val){val = value.split("T")[0] + " "  + value.split("T")[1]; }}
        // 플래시 숫자만 입력가능하도록하기
        if(name.includes("Flash")){ if(val != ""){ val = Number(val); }}
        setInputs({
          ...inputs,
          [name]: val
        });
    }, [inputs]);

    // 이미지 수정 요청
    const editImg = async () => {
        setLoading(true); // 로딩 시작
        // API에 전송할 폼 생성
        const formData = new FormData();
        formData.append('files', props.uploadImg);
        formData.append('chList', JSON.stringify(inputs));
        // 폼 전송
        await axios({
        method: 'post',
        url: 'https://api.ice-forensic.com/api/editExif', // 백엔드 REST_API 주소
        //url: 'http://127.0.0.1:5000/api/editExif', //로컬 테스트용
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob'
        }).then((Response)=>{ 
            if(Response){ setEditedImg(URL.createObjectURL(Response.data)); }
        }).catch((Error)=>{ console.log(Error); }); // 에러
        setLoading(false); // 로딩 종료
    }

    // 위치 정보 지우기 
    const delGPS = e => {
        setInputs({
            ...inputs,
            ["GPSInfo"]: ""
          });
    }

    // 사용자 입력 툴팁
    const inputTooltip = props => (
        <Tooltip {...props}>영어, 숫자만 입력 가능</Tooltip>
    );
    const inputTooltipNumber = props => (
        <Tooltip {...props}> (-1~15) 숫자만 입력 가능</Tooltip>
    );
    const inputTooltipGPS = props => (
        <Tooltip {...props}>클릭해서 위치 설정</Tooltip>
    );
    const inputTooltipDelGPS = props => (
        <Tooltip {...props}>클릭해서 위치 지우기</Tooltip>
    );
    const inputTooltipDate = props => (
        <Tooltip {...props}>우측에 달력을 클릭해서 설정</Tooltip>
    );


    return (
        <Card className="bg-dark text-white border-1 rounded" style={{ width: '100%' }}>
            <Card.Body className="p-2 bg-light">
            {
                loading && <div className='mt-3 text-dark mb-3'><h5>수정하는중</h5><Spinner animation="border" variant="dark"/></div>
            }
            {
                editedImg &&
                <Figure className='pt-0'>
                    <Figure.Image
                    width={200}
                    height={200}
                    src={ editedImg }
                    />
                    <Figure.Caption><Button href={ editedImg } download={props.fileName} variant="dark">수정된 이미지 다운로드</Button></Figure.Caption>
                </Figure>
            }
            <Table hover size="sm" variant="light" className="mb-0 p-0 text-start">
                <tbody>
                    <tr>
                        <td><GeoAltFill/> 위치</td>
                        <td>
                            <OverlayTrigger placement="left" overlay={ inputTooltipGPS }>
                                <Button size="sm" variant="light" onClick={e=>setShowSearchMap(true)} className="w-75 bg-white border">
                                    <GeoAltFill/>{ inputs["GPSInfo"] &&
                                        "(" + inputs["GPSInfo"][0].toFixed(4) + ", " + inputs["GPSInfo"][1].toFixed(4) + ")" 
                                        } 설정
                                </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="left" overlay={ inputTooltipDelGPS }>
                                <Button size="sm" variant="dark" onClick={delGPS} className="w-25 border"><Trash3Fill/></Button>
                            </OverlayTrigger>
                            { showSearchMap &&
                            <KakaomapSearCh exifData={ props.exifData } setShowSearchMap={ setShowSearchMap } showSearchMap={showSearchMap} setInputs={setInputs} inputs={inputs}/>
                            }
                        </td>
                    </tr>
                    <tr>
                        <td><CameraFill/> 제조사</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltip }><Form.Control 
                        name = 'Make' size = 'sm' maxLength='100'
                        defaultValue = {props.exifData['Make']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><CameraFill/> 모델</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltip }><Form.Control 
                        name = 'Model' size = 'sm' maxLength='100'
                        defaultValue = {props.exifData['Model']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><CameraFill/> 플래시정보</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltipNumber }><Form.Control
                        name = 'Flash' size = 'sm' max={15} min={-1}
                        type = 'number'
                        defaultValue = {props.exifData['Flash']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><CameraFill/> 프로그램</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltip }><Form.Control 
                        name = 'Software' size = 'sm' maxLength='100'
                        defaultValue = {props.exifData['Software']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><ClockFill/> 시간</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltipDate }><Form.Control
                        name = 'DateTime' size = 'sm'
                        type = 'datetime-local'
                        defaultValue={props.exifData['DateTime']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><ClockFill/> 원본촬영시간</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltipDate }><Form.Control
                        name = 'DateTimeOriginal' size = 'sm'
                        type = 'datetime-local'
                        defaultValue={props.exifData['DateTimeOriginal']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><ClockFill/> 디지털화된시간</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltipDate }><Form.Control
                        name = 'DateTimeDigitized' size = 'sm'
                        type = 'datetime-local'
                        defaultValue={props.exifData['DateTimeDigitized']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><FileEarmarkImage/> 크기</td> 
                        <td>{ props.exifData['ImageWidth'] && props.exifData['ImageWidth'] + "(너비), " + props.exifData['ImageLength'] + "(높이)" }</td>
                    </tr>
                    <tr>
                        <td><FileEarmarkImage/> ID</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltip }><Form.Control 
                        name = 'ImageUniqueID' size = 'sm' maxLength='100'
                        defaultValue = {props.exifData['ImageUniqueID']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                    <tr>
                        <td><FileEarmarkImage/> EXIF 버전</td>
                        <td><OverlayTrigger placement="left" overlay={ inputTooltip }><Form.Control 
                        name = 'ExifVersion' size = 'sm' maxLength='100'
                        defaultValue = {props.exifData['ExifVersion']}
                        onChange={onChangeInputs}/></OverlayTrigger></td>
                    </tr>
                </tbody>
            </Table>
            <Button onClick={editImg} variant="dark" className="w-100">수정하기</Button>
            </Card.Body>
        </Card>
    )
  }

export default EditExifData;