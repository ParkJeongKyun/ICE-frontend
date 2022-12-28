import React, { useCallback }  from 'react';
import { useDropzone } from 'react-dropzone';
import IceExif from './wasm/ice_exif.js'

const IceExifPromise = IceExif({
	noInitialRun: true,
	noExitRuntime: true
})

function convertDateFormat(date) {
  return date.toLocaleDateString().replace(/\./g, '').split(' ').map((v,i)=> i > 0 && v.length < 2 ? '0' + v : v).join('-') + " " + date.toTimeString().split(" ")[0];
}

function ImgDropzone(props) {
  const onChangeImg = async (file) => {
    props.setUploadImg({
      "file" : file[0], // 원본 파일
      "name" : file[0].name, // 이름
      "url" : URL.createObjectURL(file[0]), // 썸네일용
      "lastModifiedDate" : convertDateFormat(file[0].lastModifiedDate) // 마지막 수정시간
    }); // 이미지 이름, 썸네일, 마지막 수정 시간 동기화 

    file[0].arrayBuffer().then(
      data => {
        IceExifPromise.then ( mod => {
          let file_size = file[0].size
          let offset = mod._malloc(file_size);
          let dataHeap = new Uint8Array(mod.HEAPU8.buffer, offset, file_size);
          let data_list = new Uint8Array(data);
          dataHeap.set(data_list);
          let res_val = mod._ice_exif_parser(offset, file_size);
          if(res_val == 0) {
            props.setExif_result(mod.exif_result);
          } else {
            props.setExif_result({});
          }
        });
      }
    );
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
      <div>
        {
          isDragActive ?
            <span></span> :
            <span></span>   
        }
      </div>
    </div>
  );
}

export default ImgDropzone;
