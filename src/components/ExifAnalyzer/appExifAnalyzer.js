import React, { useState } from 'react';
import ImgDropzone from "./imgDropzone";
import ShowExifData from "./showExifData";

// Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Figure from 'react-bootstrap/Figure';

// Icons
import { FileEarmarkImage, Snow2 } from 'react-bootstrap-icons';


// 이미지 EXIF 분석기 메인 컴포넌트
function AppExifAnalyzer() {
  // EXIF 데이터 정보
  const [exif_result, setExif_result] = useState({});
  const [hasExif, setHasExif] = useState(false) // EXIF를 가지고 있는가?
  const [uploadImg, setUploadImg] = useState(null); // 업로드 이미지
  const [loading, setLoading] = useState(false); // 로딩 여부

  return (
    <Container>
      아직 테스트 중입니다.
      <Alert variant="info">
        <Alert.Heading><FileEarmarkImage/> 이미지 EXIF 분석기</Alert.Heading>
        이미지 안에 있는 메타데이터(EXIF)를 분석해서 날짜, 위치, 카메라 정보 등을 보여줍니다.<br/>
        <hr />
        <p>
          <Snow2/> 분석 가능한 이미지 포맷 : JPG, PNG<br/>
          <Snow2/> 일부 이미지는 EXIF 정보가 없을 수 있습니다.<br/>
          <Snow2/> 위치 정보는 주소가 없는 경우 좌표(위도, 경도)만 나옵니다.<br/>
          <Snow2/> 위치가 해외인 경우 지도 사용이 불가능합니다.
        </p>
      </Alert>
        <Container className='mt-1 mb-1 bg-dark rounded text-center'>
          <Row>
            <Col md={4} className='p-3'>
              <ImgDropzone setUploadImg={setUploadImg} setExif_result={setExif_result}/>
              {
                    uploadImg &&
                    <Figure className='pt-5'>
                      <Figure.Image
                        width={200}
                        height={200}
                        src={uploadImg.url}
                      />
                      <Figure.Caption className="text-info">
                        {uploadImg.name}
                      </Figure.Caption>
                      <Figure.Caption className="text-light">
                        {uploadImg.lastModifiedDate} 
                      </Figure.Caption>
                      <Figure.Caption>
                      (마지막 수정시간) 
                      </Figure.Caption>
                    </Figure>
                  }
            </Col>
            <Col md={8} className='p-3'>
              <ShowExifData exif_result={exif_result}/>
            </Col>
          </Row>
        </Container>
    </Container>
  );
}

export default AppExifAnalyzer;