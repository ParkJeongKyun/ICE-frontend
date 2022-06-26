/*global kakao */
import React, { useEffect } from "react";

// 카카오맵
export default function Kakaomap(props) {
  useEffect(() => {
    if(props.exifData["GPSInfo"]) { mapscript(); };
  }, [props.exifData]);

  const mapscript = () => {
    kakao.maps.disableHD();
    let lat = props.exifData["GPSInfo"][0]; // 위도
    let lon = props.exifData["GPSInfo"][1]; // 경도
    let container = document.getElementById("map");
    let options = {
      center: new kakao.maps.LatLng(lat, lon),
      level: 3,
    };
    //지도
    const map = new kakao.maps.Map(container, options);

    //주소-좌표 변환 객체
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.coord2Address(lon, lat, function(result, status) {
      // 정상적으로 검색이 완료됐으면 
       if (status === kakao.maps.services.Status.OK) {
        props.setLocation(result[0]); // 좌표로 주소 정보 얻어서 반환
      }
    });   
    
    //마커가 표시 될 위치
    let markerPosition = new kakao.maps.LatLng(
      lat, lon
    );

    // 마커를 생성
    let marker = new kakao.maps.Marker({
      position: markerPosition,
    });

    // 마커를 지도 위에 표시
    marker.setMap(map);
  };

  return <div id="map" className="rounded" style={{ width: "100%", height: "200px" }}></div>;
}