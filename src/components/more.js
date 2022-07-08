import React from 'react';

//Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Mailbox, FilePerson, Server, WrenchAdjustable, Github, Stars, MortarboardFill, ChatRightTextFill, FlagFill, PostcardFill, CalendarCheckFill, EmojiWink, WrenchAdjustableCircleFill } from 'react-bootstrap-icons';

// 더보기 페이지
function More() {
    return (
      <Container className="bg-dark p-3 rounded">
        <Row>
          <Col md={12}>
            <Alert variant="info">
              <Alert.Heading><Stars/> 안녕하세요!</Alert.Heading>
              <p>
                무료 포렌식 웹 애플리케이션을 만들고 싶었습니다.<br/>
                제가 만든게 누군가에게 의미가 있었으면 좋겠습니다.
              </p>
              <p>
                아직 별 기능도 많이 없고 미약합니다.<br/>
                가볍게 이용해주시고 업데이트를 기대해주세요!
              </p>
              <p>
                <EmojiWink/> 사이트를 찾아주신 분들, 프레임워크, 플랫폼, 언어 개발자 분들께 감사합니다.
              </p>
              <p>
                <Stars/> 문의 사항또는 피드백은 개발자 이메일 혹은 개발자 블로그를 이용해주시면 감사하겠습니다.<Stars/>
              </p>
            </Alert>
          </Col>
          <Col md={12}>
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
                <FlagFill/> 해군 3함대사령부 정보보호병 병장 만기 전역<br/>
              </p>
              <hr/>
              <p>
                <WrenchAdjustableCircleFill/> (개인) 네이버 뉴스 크롤링 분석기 웹앱 개발<br/>
                <WrenchAdjustableCircleFill/> (참여) 코로나나우(<a target="_blank" href="https://coronanow.kr">coronanow.kr</a>) 웹사이트 백엔드 크롤러 개발<br/>
                <WrenchAdjustableCircleFill/> (개인) ICE 무료 포렌식 웹 애플리케이션 개발
              </p>
            </Alert>
          </Col>
          <Col md={6}>
            <Alert variant="warning">
              <Alert.Heading><Server/> ICE FrontEnd</Alert.Heading>
              <p>
                WEB SERVER<br/>
                언어 : Javascript, HTML, CSS<br/>
                프레임워크 : React, Bootstrap, KakaoMap<br/>
                소프트웨어 플랫폼 : Node.js<br/>
                배포 플랫폼 : Netlify<br/>
                <a target="_blank" className="text-warning" href="https://github.com/ParkJeongKyun/ICE-frontend"><Github/>소스코드</a>
              </p>
            </Alert>
          </Col>
          <Col md={6}>
            <Alert variant="danger">
              <Alert.Heading><Server/> ICE BackEnd</Alert.Heading>
              <p>
                REST API SERVER<br/>
                언어 : Python<br/>
                프레임워크 : Flask, Pillow, Gunicorn<br/>
                소프트웨어 플랫폼 : Nginx<br/>
                배포 플랫폼 : Google Cloud Platform(Compute Engine, Ubuntu)<br/>
                <a target="_blank" className="text-danger" href="https://github.com/ParkJeongKyun/ICE-backend"><Github/>소스코드</a>
              </p>
            </Alert>
          </Col>
          <Col md={12}>
            <Alert variant="dark">
              <Alert.Heading><WrenchAdjustable/> 업데이트 예정</Alert.Heading>
              <p>
                - 이미지 업로드 제한 크기 늘리기<br/>
                - 사용자가 수정 값 입력 후 새로운 사진 업로드시 수정값도 동기화 시키기<br/>
                - 플래시 정보 한글화<br/>
                - 사이트 디자인 수정/편의성 업그레이드<br/>
                - 현재 제공되는 분석/수정 가능한 데이터 외에 다른 EXIF 정보도 분석/수정 가능하게 구현<br/>
                - 이미지 위치 수정시, 현재 위치, 지도 클릭 위치로 지정하는 기능 추가<br/>
                - 이미지 EXIF 분석 외 다른 포렌식 툴 추가<br/>
                - (선택) 댓글, 광고 추가<br/>
                - 메인/소개 페이지 추가
              </p>
            </Alert>
          </Col>
          <Col md={12}>
            <Alert variant="info">
              <Alert.Heading><Stars/> 업데이트 내역</Alert.Heading>
              <p>
                <CalendarCheckFill/> 사이트 첫 배포 : 22.06.23<br/>
                <CalendarCheckFill/> EXIF 수정 기능 추가 : 22.07.07<br/>
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }
  
export default More;