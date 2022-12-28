import React, { useCallback }  from 'react';

import { Table } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function ShowExifData(props) {
  const exif_result = props.exif_result;
  return (
    <Table hover size="sm" variant="dark" className="mb-0 p-0 text-start round">
    <tbody>
    <InputConponent value={exif_result.exif_make} name="제조사"/>
      <InputConponent value={exif_result.exif_carmera_model} name="카메라 모델"/>
      <InputConponent value={exif_result.exif_software} name="소프트웨어"/>
      <InputConponent value={exif_result.exif_bit_per_sample} name="샘플당 비트 수"/>
      <InputConponent value={exif_result.exif_width} name="이미지 너비"/>
      <InputConponent value={exif_result.exif_height} name="이미지 높이"/>
      <InputConponent value={exif_result.exif_description} name="이미지 주석"/>
      <InputConponent value={exif_result.exif_orientation} name="이미지 회전"/>
      <InputConponent value={exif_result.exif_copyright} name="이미지 저작권"/>
      <InputConponent value={exif_result.exif_datetime} name="이미지 편집날짜"/>
      <InputConponent value={exif_result.exif_original_datetime} name="이미지 촬영날짜"/>
      <InputConponent value={exif_result.exif_digitize_datetime} name="이미지 디지털화날짜"/>
      <InputConponent value={exif_result.exif_subsecond_time} name="날짜 초 단위"/>
      <InputConponent value={exif_result.exif_exposure_time} name="노출 시간" unit="1/0 s"/>
      <InputConponent value={exif_result.exif_fstop} name="조리개 개폐 정도" unit="f/8.0"/>
      <InputConponent value={exif_result.exif_exposure_program} name="노출 프로그램"/>
      <InputConponent value={exif_result.exif_iso_speed} name="감광 속도"/>
      <InputConponent value={exif_result.exif_subject_distance} name="피사체 거리" unit="m"/>
      <InputConponent value={exif_result.exif_exposure_bias} name="노출 보정" unit="EV"/>
      <InputConponent value={exif_result.exif_flash} name="플래시"/>
      <InputConponent value={exif_result.exif_flash_returned_light} name="플래시 역광"/>
      <InputConponent value={exif_result.exif_flash_mode} name="플래시 모드"/>
      <InputConponent value={exif_result.exif_metering_mode} name="측광 모드"/>
      <InputConponent value={exif_result.exif_focal_length} name="초점" unit="mm"/>
      <InputConponent value={exif_result.exif_focal_length_in35mm} name="35mm에서 초점" unit="mm"/>
      <InputConponent value={exif_result.exif_gps_latitude} name="위도" unit="deg"/>
      <InputConponent value={exif_result.exif_gps_longitude} name="경도" unit="deg"/>
      <InputConponent value={exif_result.exif_gps_altitude} name="고도" unit="m"/>
      <InputConponent value={exif_result.exif_gps_dop} name="척도"/>
      <InputConponent value={exif_result.exif_focal_length_min} name="초점 최소" unit="mm"/>
      <InputConponent value={exif_result.exif_focal_length_max} name="초점 최대" unit="mm"/>
      <InputConponent value={exif_result.exif_fstop_min} name="조리개 최소 개폐" unit="f/0.0"/>
      <InputConponent value={exif_result.exif_fstop_max} name="조리개 최대 개폐" unit="f/0.0"/>
      <InputConponent value={exif_result.exif_lens_make} name="랜즈 제조사"/>
      <InputConponent value={exif_result.exif_lens_model} name="랜즈 모델"/>
      <InputConponent value={exif_result.exif_focal_plane_xres} name="초점 x"/>
      <InputConponent value={exif_result.exif_focal_plane_yres} name="초점 y"/>
    </tbody>
    </Table>
  );
}

function InputConponent(props) {
  return (
    <tr>
      <td><span>{props.name}</span></td>
      <td>
      <InputGroup className="mb-3">
        <Form.Control
          defaultValue={props.value}
          placeholder="정보없음"
          aria-describedby="basic-addon1"
          readOnly
          size="sm"
        />
        { props.unit &&
          <InputGroup.Text size="sm">{props.unit}</InputGroup.Text>        
        }
      </InputGroup>
      </td>
    </tr>
  );
}

export default ShowExifData;