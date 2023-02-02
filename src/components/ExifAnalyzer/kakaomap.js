/* global kakao */
import React, { useEffect, useState, useLayoutEffect } from "react";

// Style
import '../../styles/map.css';

// 카카오맵
function Kakaomap(props) {
  useLayoutEffect(() => {
    let [lat, lng] = props.gps_info;
    if(lat && lng) { // GPS 정보가 정상인 경우
      try {
        // 맵 생성
        mapscript(lat, lng);
      }
      catch(e) {
        console.log(e);
      }
    }
  }, [props.gps_info]);

  // 맵 생성 스크립트
  const mapscript = (lat, lng) => {
    let container = document.getElementById("map");
    let options = {
      center: new kakao.maps.LatLng(lat, lng),
      level: 3,
    }
    //지도
    const map = new kakao.maps.Map(container, options);

    //마커가 표시 될 위치
    let markerPosition = new kakao.maps.LatLng(
      lat, lng
    );

    // 마커를 생성
    let marker = new kakao.maps.Marker({
      position: markerPosition,
    });

    // 마커를 지도 위에 표시
    marker.setMap(map);
  }

  return (
    <>
        <div id="map" className="rounded" style={{width: "100%", height: "200px"}}></div>
    </>
  );
}

export default Kakaomap;