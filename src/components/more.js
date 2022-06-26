import React from 'react';

//Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Mailbox, Snow, FilePerson, Server, WrenchAdjustable, Github, Stars, MortarboardFill, ChatRightTextFill, FlagFill, PostcardFill, CalendarCheckFill, EmojiWink } from 'react-bootstrap-icons';

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
                <EmojiWink/> 사이트를 찾아주신 분들, 프레임워크, 플랫폼, 언어 개발자 분들께 감사합니다.<br/>
              </p>
            </Alert>
          </Col>
          <Col md={12}>
            <Alert variant="primary">
              <Alert.Heading><FilePerson/> 개발자</Alert.Heading>
              <p>
                박정균 <span className="text-primary">Park Jeong-kyun</span> (2001.02.23) <br/>
                <ChatRightTextFill/> "특별히 내세울건 없지만 누군가에게 도움 줄 수 있는, 의미 있는 사람이 되고 싶습니다."<br/>
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
                <FlagFill/> 네이버 뉴스 크롤링 분석기 웹앱 개발<br/>
                <FlagFill/> 코로나나우(coronanow.kr) 웹사이트 백엔드 크롤링 개발<br/>
                <FlagFill/> ICE 무료 포렌식 웹 애플리케이션 개발<br/>
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
                - EXIF 데이터 정보 수정 앱 추가<br/>
                - 다른 포렌식 툴 추가
              </p>
            </Alert>
          </Col>
          <Col md={12}>
            <Alert variant="info">
              <Alert.Heading><Stars/>역사</Alert.Heading>
              <p>
                <CalendarCheckFill/> 사이트 첫 배포 : 22.06.23<br/>
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }
  
export default More;