import React, { useCallback }  from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

//Bootstrap
import { CloudArrowUpFill } from 'react-bootstrap-icons';

// 날짜 포매팅
function convertDateFormat(date) {
  return date.toLocaleDateString().replace(/\./g, '').split(' ').map((v,i)=> i > 0 && v.length < 2 ? '0' + v : v).join('-') + " " + date.toTimeString().split(" ")[0];
}

// 이미지 드롭존
function ImgDropzone(props) {
  const onChangeImg = async (file) => {
    if(file && file[0].size < 10000000 ){ // 10M 미만
      props.setLoading(true); // 로딩 시작
      props.setOverSize(false); // 파일 사이즈 확인
      // API에 전송할 폼 생성
      const formData = new FormData();
      formData.append('files', file[0]);
      // 폼 전송
      await axios({
        method: 'post',
        url: 'https://api.ice-forensic.com/api/getExif', // 백엔드 REST_API 주소
        //url: 'http://127.0.0.1:5000/api/getExif', // 로컬 테스트용
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((Response)=>{
        props.setExifData(Response.data); // 받은 데이터 동기화
        props.setUploadImg({
          "file" : file[0], // 원본 파일
          "name" : file[0].name, // 이름
          "url" : URL.createObjectURL(file[0]), // 썸네일용
          "lastModifiedDate" : convertDateFormat(file[0].lastModifiedDate) // 마지막 수정시간
        }); // 이미지 이름, 썸네일, 마지막 수정 시간 동기화 
      }).catch((Error)=>{ console.log(Error); }); // 에러
      props.setKey('analysis'); // 결과 화면으로 변경, 카카오맵 때문에 해줘야함
      props.setLoading(false); // 로딩 종료
    } else { props.setOverSize(true); } // 파일 사이즈 너무 큼
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
    <div className="rounded text-center bg-secondary text-white"
    style={{
      cursor: "pointer",
      height: "200px",
      border: "1px dashed white",
      borderRadius:"25px"
    }}
    {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="p-5">
        <h1> <CloudArrowUpFill/></h1>
        {
          isDragActive ?
            <span> 사진을 드롭 해주세요</span> :
            <span> <p>사진을 올려놓거나<br/>눌러서 업로드 하세요<br/>(<span className='text-info'>10MB 미만</span>)</p></span>   
        }
      </div>
    </div>
  )
}

export default ImgDropzone;