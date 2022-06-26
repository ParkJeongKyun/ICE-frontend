import React, { useState } from 'react';
import ImgDropzone from "./imgDropzone";
import ShowExifData from "./showExifData";

//Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Figure from 'react-bootstrap/Figure';
import Spinner from 'react-bootstrap/Spinner';

import { ExclamationTriangleFill, Windows, Google, Apple, FileEarmarkImage , Snow2 } from 'react-bootstrap-icons';


// 이미지 EXIF 분석기 메인 컴포넌트
function AppExifAnalyzer() {
  // EXIF 데이터 정보
  const [ exifData, setExifData] = useState({
        'EXIF': null,
        'ImageWidth': null, 
        'ImageLength': null,
        'Make': null,
        'Model': null,
        'Software': null,
        'DateTime': null,
        'GPSInfo': null,
        'ExifVersion': null,
        'DateTimeOriginal': null,
        'DateTimeDigitized': null,
        'Flash': null,
        'ImageUniqueID': null,
  });

  const [ uploadImg, setUploadImg ] = useState(); // 업로드 이미지
  const [ loading, setLoading ] = useState(false); // 로딩 여부
  const [ overSize, setOverSize ]  = useState(false); // 사이즈 초과 여부

  return (
    <Container>
      <Alert variant="info">
        <Alert.Heading><FileEarmarkImage/> 이미지 EXIF 분석기</Alert.Heading>
        이미지 안에 있는 메타데이터(EXIF)를 분석해서 날짜, 위치, 카메라 정보 등을 보여줍니다.
        <hr />
        <p>
          <Snow2/> 분석 가능한 이미지 포맷 : PNG, JPG<br/>
          <Snow2/> EXIF 데이터는 쉽게 조작될 수 있으며 너무 신뢰해서는 안됩니다.<br/>
          <Snow2/> 일부 이미지는 EXIF 정보가 없을 수 있습니다.<br/>
          <Snow2/> 위치 정보는 주소가 없는 경우 (위도, 경도)만 나옵니다.<br/>
          <Snow2/> 주소가 해외인 경우 지도가 표시되지 않을 수 있습니다.
        </p>
      </Alert>
      <AlertDismissible/>
      {
        overSize && <Alert variant="danger" onClose={() => setOverSize(false)} dismissible><ExclamationTriangleFill/> 파일 사이즈가 너무 큽니다. 10MB 미만의 파일을 올려주세요</Alert>
      }
        <Container className='mt-1 mb-1 bg-dark rounded text-center'>
            <Row>
                <Col md={4} className='p-3'>
                  <ImgDropzone setExifData={ setExifData } setUploadImg={ setUploadImg } setLoading={ setLoading } setOverSize={ setOverSize }/>
                  {
                    loading && <div className='mt-3 text-white'><h5>분석중</h5><Spinner animation="border" variant="info"/></div>
                  }
                  {
                    uploadImg &&
                    <Figure className='pt-5'>
                      <Figure.Image
                        width={200}
                        height={200}
                        src={ uploadImg.url }
                      />
                      <Figure.Caption className="text-secondary">
                        { uploadImg.name }
                      </Figure.Caption>
                      <Figure.Caption className="text-light">
                        { uploadImg.lastModifiedDate } 
                      </Figure.Caption>
                      <Figure.Caption>
                      (마지막 수정시간) 
                      </Figure.Caption>
                    </Figure>
                  }
                </Col>
                <Col md={8} className='p-3'>
                  <ShowExifData exifData={ exifData }/>
                </Col>
            </Row>
        </Container>
    </Container>
  );
}

// 경고 알림, 나중에 재사용 가능하도록 컴포넌트 수정하자
function AlertDismissible() {
  const [show, setShow] = useState(true);
  if (show) {
    return (
      <Alert variant="danger" onClose={() => setShow(false)} dismissible>
        <Alert.Heading><Windows/> PC 또는 <Google/> Android 환경에서 사용을 권장합니다</Alert.Heading>
        <p>
          <Apple/> 아이폰에 경우 보안상에 이유로 제대로 동작하지 않습니다.<br/>
          <Google/> 안드로이드도 내파일, 갤러리를 이용해서 업로드 하시면 제대로 동작하지 않습니다.<br/>
          <Google/> 모바일 크롬 이용시 찾아보기를 눌러서 파일을 업로드해주세요.<br/>
          그렇지 않은 경우 일부 EXIF 데이터가 지워진 채로 업로드됩니다.
        </p>
      </Alert>
    );
  }
  return null;
}


export default AppExifAnalyzer;