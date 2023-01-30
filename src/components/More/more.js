import React from 'react';

//Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Mailbox, FilePerson, Server, WrenchAdjustable, Github, Stars,
  MortarboardFill, ChatRightTextFill, FlagFill, PostcardFill, CalendarCheckFill,
  EmojiWink, WrenchAdjustableCircleFill, BriefcaseFill, ArrowRightShort, Award } from 'react-bootstrap-icons';


function InfoMain() {
  return (
    <Alert variant="info">
      <Alert.Heading><Stars/> 안녕하세요!</Alert.Heading>
      <p>
        무료 포렌식 웹 애플리케이션을 만들고 싶었습니다.<br/>
        제가 만든게 누군가에게 의미가 있었으면 좋겠습니다.
      </p>
      <p>
        <EmojiWink/> 사이트를 찾아주신 분들, 프레임워크, 플랫폼, 언어 개발자 분들께 감사합니다.
      </p>
      <p>
        <Stars/> 문의 사항또는 피드백은 개발자 이메일 혹은 개발자 블로그를 이용해주시면 감사하겠습니다.<Stars/>
      </p>
    </Alert>
  )
}

function InfoDeveloper() {
  return (
    <Alert variant="primary">
      <Alert.Heading><FilePerson/> 개발자</Alert.Heading>
      
        <h5>박정균 <span className="text-primary">Park Jeong-kyun</span> (2001.02.23)</h5>
        <hr/>
      <p>
        <ChatRightTextFill/> "특별히 내세울건 없어도 누군가에게 도움 줄 수 있는, 의미 있는 사람이 되고 싶습니다."<br/>
        <Mailbox/> dbzoseh84@gmail.com<br/>
        <PostcardFill/> 블로그 <a target="_blank" href="https://blog.naver.com/dbzoseh84">https://blog.naver.com/dbzoseh84</a>
      </p>
        <hr/>
      <p>
        <MortarboardFill/> 협성고등학교 졸업<br/>
        <MortarboardFill/> 영진직업전문학교 위탁학생 졸업<br/>
        <FlagFill/> 해군 3함대사령부 정보보호병(CERT) 병장 만기 전역<br/>
      </p>
      <hr/>
      <p>
        <BriefcaseFill/> NuriggumSoft(주) 지능개발팀 재직중 (2022.7.25 ~)<br/>
        <Mailbox/> jk.park@nuriggum.com 
      </p>
      <hr/>
      <Alert variant="danger">
      <p>
        <WrenchAdjustableCircleFill/> (개인) 네이버 뉴스 크롤링 분석기 웹앱 개발 <ArrowRightShort/> 종료<br/>
        <WrenchAdjustableCircleFill/> (참여) 코로나나우(<a target="_blank" href="https://coronanow.kr">coronanow.kr</a>) 웹사이트 백엔드 크롤러 개발 <ArrowRightShort/> 종료<br/>
        <WrenchAdjustableCircleFill/> (개인) ICE 무료 포렌식 웹 애플리케이션 개발 <ArrowRightShort/> 진행중<br/>
        <WrenchAdjustableCircleFill/> (기업) LG 화학 PlantAI Backend 개발 / ETL 데이터 엔지니어링 <ArrowRightShort/> 종료<br/>
        <WrenchAdjustableCircleFill/> (기업) 지방재정 AI 분석 환경 개발 / ETL 데이터 엔지니어링 <ArrowRightShort/> 진행중
      </p>
      </Alert>
      <hr/>
      <p>
        <Award/> 디지털포렌식 전문가 2급 (2022. 12. 23)<br/>
        <Award/> 정보처리산업기사 (2022. 08. 10)<br/>
        <Award/> 정보처리기능사 (2018. 09. 06)<br/>
        <Award/> 네트워크관리사2급 (2018. 09. 11)<br/>
        <Award/> 리눅스마스터2급 (2018. 12. 21)<br/>
      </p>
    </Alert>
  )
}

function InfoApplication() {
  return (
    <Alert variant="warning">
      <Alert.Heading><Server/> ICE</Alert.Heading>
      <p>
        WEB SERVER<br/>
        언어 : Javascript, HTML, CSS, C++(WASM)<br/>
        프레임워크 : React, Bootstrap, KakaoMap, Emscripten<br/>
        배포 플랫폼 : Netlify<br/>
        <a target="_blank" className="text-warning" href="https://github.com/ParkJeongKyun/ICE-frontend"><Github/>소스코드</a>
      </p>
      <Alert variant="info">
        <Alert.Heading><Stars/> 업데이트 내역</Alert.Heading>
        <p>
          <CalendarCheckFill/> 22.06.23 : 사이트 첫 배포<br/>
          <CalendarCheckFill/> 22.07.07 : EXIF 수정 기능 추가<br/>
          <CalendarCheckFill/> 22.08.01 : Backend Framework를 Flask에서 Fastapi로 변경<br/>
          <CalendarCheckFill/> 22.11.15 : Backend API(Python, Nginx, GCP) 폐쇄, 단순화, 업그레이드 준비<br/>
          <CalendarCheckFill/> 22.12.24 : Python Backend를 웹어셈블리(C++를 컴파일한) 파일로 대체<br/>
          <CalendarCheckFill/> 22.01.30 : 사이트 디자인 화면 업그레이드 개발중... 언제 마음에 들게 나올까요?<br/>
        </p>
      </Alert>
      <Alert variant="dark">
        <Alert.Heading><Stars/> 참고 소스 출처 </Alert.Heading>
        <p>
          <CalendarCheckFill/><a target="_blank" className="text-dark" href="https://ko.reactjs.org/"> 리액트</a><br/>
          <CalendarCheckFill/><a target="_blank" className="text-dark" href="https://getbootstrap.kr"> 부트스트랩</a><br/>
          <CalendarCheckFill/><a target="_blank" className="text-dark" href="https://apis.map.kakao.com/"> 카카오맵</a><br/>
          <CalendarCheckFill/><a target="_blank" className="text-dark" href="https://github.com/Devwares-Team/cdbreact-admin-template"> 대쉬보드 디자인/템플릿 참고</a><br/>
          <CalendarCheckFill/> C++를 wasm으로 컴파일 하기 : <a target="_blank" className="text-dark" href="https://emscripten.org/">Emscripten</a><br/>
          <CalendarCheckFill/> C++ 모듈 참고 소스  : <a target="_blank" className="text-dark" href="https://github.com/mayanklahiri/easyexif"><Github/>Easyexif</a><br/>
          <CalendarCheckFill/> 노트북 모델 및 Three.js 참고 소스  : <a target="_blank" className="text-dark" href="https://codesandbox.io/s/9keg6">Mixing HTML and WebGL w/ occlusion</a><br/>
        </p>
      </Alert>
    </Alert>
  )
}

// 더보기 페이지
function More() {
  return (
    <Container className="bg-dark p-3 rounded">
      <Row>
        <Col md={12}>
          <InfoMain/>
        </Col>
        <Col md={12}>
          <InfoDeveloper/>
        </Col>
        <Col md={12}>
          <InfoApplication/>
        </Col>
      </Row>
    </Container>
  );
}
  
export default More;