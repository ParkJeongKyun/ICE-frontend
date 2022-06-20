import React, { useCallback }  from 'react';
import axios from 'axios';
import {useDropzone} from 'react-dropzone';

//Bootstrap
import Alert from 'react-bootstrap/Alert';
import { CloudArrowUpFill } from 'react-bootstrap-icons';

function ImgDropzone(props) {
  const onChangeImg = async (file) => {
    if(file && file[0].size < 5000000){
      props.setLoading(true);
      const formData = new FormData();
      formData.append('files', file[0]);
      await axios({
        method: 'post',
        url: 'https://34.83.113.61/api/getExif',
        //url: process.env.REACT_APP_DB_HOST + '/api/getExif',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((Response)=>{
        props.setExifData(Response.data);
        props.setUploadImg({
          "name" : file[0].name,
          "url" : URL.createObjectURL(file[0]),
          "lastModifiedDate" : file[0].lastModifiedDate.toISOString().replace("T", " ").replace(/\..*/, '')
        });
        console.log(file[0].lastModifiedDate);
        props.setLoading(false);
      }).catch((Error)=>{console.log(Error);props.setLoading(false);});
    }
  }
  const onDrop = useCallback(acceptedFiles => {
        onChangeImg(acceptedFiles);
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop, accept: {
    'image/jpeg': [],
    'image/png': []}}
    )

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
            <span> 사진을 올려놓거나 눌러서 업로드 하세요(5MB미만)</span>   
        }
      </div>
    </div>
  )
}

export default ImgDropzone;