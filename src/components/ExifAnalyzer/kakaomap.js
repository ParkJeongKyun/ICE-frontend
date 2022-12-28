/*global kakao */
import React, { useEffect, useState } from "react";

import '../../styles/map.css';
//Bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { GeoAltFill } from 'react-bootstrap-icons';

// 카카오맵
function Kakaomap(props) {
  useEffect(() => {
    if(props.exifData["GPSInfo"]) {mapscript()};
  }, [props.exifData]);

  const mapscript = () => {
    let [lat, lon] = props.exifData["GPSInfo"];
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

  return <div id="map" className="rounded" style={{width: "100%", height: "200px"}}></div>;
}




// 카카오맵 검색 API
function KakaomapSearCh(props) {
  // 오프캔버스 용
  const handleClose = () => props.setShowSearchMap(false);

  // 모달 용
  const [modalShow, setModalShow] = useState(false);
  const modalHandleClose = () => setModalShow(false);
  const modalHandleShow = () => setModalShow(true);

  // 카카오맵
  const [map, setMap] = useState(); // 지도
  const [ps, setPs] = useState(new kakao.maps.services.Places()); // 장소 검색 객체
  const [markers, setMarkers] =  useState([]); // 마커들
  const [infowindow, setInfowindow] =  useState(); // 정보를 보여주는 인포윈도우

  // 선택한 위치
  const [selLocation, setSelLocation] = useState();

  useEffect(() => { // 첫 마운트 실행
    if(props.exifData["GPSInfo"]) { mapscript( // 원래 GPS 정보가 있는경우
      props.exifData["GPSInfo"][0], props.exifData["GPSInfo"][1] // 위도, 경도
    );} else { // 원래 GPS 정보가 없으면
      mapscript(
        37.56682420267543, 126.978652258823  // 서울시청, 기본
    )}
  }, [props.exifData]);

  // 카카오맵 메인 스크립트
  const mapscript = (lat, lon) => {
    let container = document.getElementById("map_search");
    let options = {
      center: new kakao.maps.LatLng(lat, lon),
      level: 3,
    };
    // 카카오맵 만들기
    setMap(new kakao.maps.Map(container, options));
    // 마커리스트 만들기
    setMarkers([]);
    // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
    setInfowindow(new kakao.maps.InfoWindow({zIndex:1}));
  };

  // 위치 설정 종료
  function endSearch() {
    props.setInputs({
      ...props.inputs,
      ["GPSInfo"]: [selLocation.lat, selLocation.lon]
    });
    modalHandleClose();
    handleClose();
  }

  // 위치 설정 선택창
  function setLoaction(title, lat, lon) {
    setSelLocation({
      "title" : title,
      "lat" : lat,
      "lon" : lon
    });
    modalHandleShow();
  }

  // 키워드 검색을 요청하는 함수입니다
  function searchPlaces(e) {
    e.preventDefault(); // Submit 새로고침 방지
    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch( keyword, placesSearchCB); 
  }

  // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
  function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) { // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        displayPlaces(data);
        // 페이지 번호를 표출합니다
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        //alert('검색 결과가 존재하지 않습니다.');
        return;
    } else if (status === kakao.maps.services.Status.ERROR) {
        //alert('검색 결과 중 오류가 발생했습니다.');
        return;
    }
  }

  // 검색 결과 목록과 마커를 표출하는 함수입니다
  function displayPlaces(places) {

    var listEl = document.getElementById('placesList'), 
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createDocumentFragment(), 
    bounds = new kakao.maps.LatLngBounds(), 
    listStr = '';
    
    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();
    
    for ( var i=0; i<places.length; i++ ) {

        // 마커를 생성하고 지도에 표시합니다
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i), 
            itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시합니다
        // mouseout 했을 때는 인포윈도우를 닫습니다
        (function(marker, title) {
            kakao.maps.event.addListener(marker, 'mouseover', function() {
              displayInfowindow(marker, title);
            });

            kakao.maps.event.addListener(marker, 'mouseout', function() {
              infowindow.close();
            });

            kakao.maps.event.addListener(marker, 'click', function() {
              setLoaction(title, marker.getPosition().Ma, marker.getPosition().La);
            });

            itemEl.onmouseover =  function () {
              displayInfowindow(marker, title);
            };

            itemEl.onmouseout =  function () {
                infowindow.close();
            };
            itemEl.onclick =  function () {
              setLoaction(title, marker.getPosition().Ma, marker.getPosition().La);
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }

    // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
  }

  // 검색결과 항목을 Element로 반환하는 함수입니다
  function getListItem(index, places) {

    var el = document.createElement('li'),
    itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                '<div class="info">' +
                '   <span>' + places.place_name + '</span>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }
                
      itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div>';           

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
  }

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage 
        });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    setMarkers(
      [...markers, marker] // 배열에 생성된 마커를 추가합니다
    );

    return marker;
  }

  // 지도 위에 표시되고 있는 마커를 모두 제거합니다
  function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }   
    setMarkers([]);;
  }

  // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
  function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }

    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
  }

  // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
  // 인포윈도우에 장소명을 표시합니다
  function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
    infowindow.setContent(content);
    infowindow.open(map, marker);
  }

  // 검색결과 목록의 자식 Element를 제거하는 함수입니다
  function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
  }

  return (
    <Offcanvas className="w-100 h-100 bg-dark" show={props.showSearchMap} onHide={handleClose} placement="top">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="text-white"><GeoAltFill/> 위치 찾기</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
      <div id="map_search" className="rounded" style={{width: "100%", height: "100%"}}/>
      <div id="menu_wrap" className="bg-white">
        <div className="option">
            <div>
            <form onSubmit={searchPlaces}>
              <Form.Control type="text" id="keyword" size="sm" placeholder="키워드 또는 주소를 입력하세요"/>
            </form>
            </div>
        </div>
        <hr/>
        <ul id="placesList" style={{padding : 0}}></ul>
        <div id="pagination"></div>
      </div>

      <Modal show={modalShow} onHide={modalHandleClose} className="text-center">
        <Modal.Header closeButton>
          <Modal.Title>이 위치로 선택하시겠습니까?</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selLocation&& <p>{selLocation.title}<br/>({selLocation.lat}, {selLocation.lon})</p>}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={modalHandleClose}>
            취소
          </Button>
          <Button variant="dark" onClick={endSearch}>
            선택
          </Button>
        </Modal.Footer>
      </Modal>
      </Offcanvas.Body>
    </Offcanvas>
  )
}


export { Kakaomap, KakaomapSearCh };