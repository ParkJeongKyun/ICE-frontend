import React, { useState } from 'react';
import ImgDropzone from "./imgDropzone";
import ShowExifData from "./showExifData";

//Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Figure from 'react-bootstrap/Figure';
import Spinner from 'react-bootstrap/Spinner';


function AppExifAnalyzer() {
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

  const [ uploadImg, setUploadImg] = useState();
  const [loading, setLoading] = useState(false);

  return (
        <Container className='mt-3 mb-3 bg-dark rounded text-center'>
            <Row>
                <Col md={4} className='p-3'>
                  <ImgDropzone setExifData={ setExifData } setUploadImg={ setUploadImg } setLoading={ setLoading }/>
                  {
                    loading && <div className='mt-3 text-white'><h5>분석중</h5><Spinner animation="border" variant="light"/></div>
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
  );
}

export default AppExifAnalyzer;