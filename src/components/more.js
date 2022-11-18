import React from 'react';

//Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Mailbox, FilePerson, Server, WrenchAdjustable, Github, Stars,
  MortarboardFill, ChatRightTextFill, FlagFill, PostcardFill, CalendarCheckFill,
  EmojiWink, WrenchAdjustableCircleFill, BriefcaseFill, ArrowRightShort, Award } from 'react-bootstrap-icons';

// 더보기 페이지
function More() {
  return (
    <Container className="bg-dark p-3 rounded">
      <Row>
        <Col md={12}>
          <Alert variant="info">
            <Alert.Heading><Stars/> 안녕하세요!</Alert.Heading>
            <p>
              -----------------------------<br/>
              이미지 분석 기능은 잠시 중지했습니다.<br/>
              (파이썬 백엔드 API 서버 폐쇄 조치 = GCP 사용 종료)<br/>
              더욱 더 가볍고 새로운 신기술을 사용해 볼 예정입니다!<br/>
              ----------------------------------
            </p>
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
              <BriefcaseFill/> NuriggumSoft(주) 지능개발팀 연구원 재직중 (2022.7.25 ~)<br/>
              <Mailbox/> jk.park@nuriggum.com 
            </p>
            <hr/>
            <p>
              <WrenchAdjustableCircleFill/> (개인) 네이버 뉴스 크롤링 분석기 웹앱 개발 <ArrowRightShort/> 종료<br/>
              <WrenchAdjustableCircleFill/> (참여) 코로나나우(<a target="_blank" href="https://coronanow.kr">coronanow.kr</a>) 웹사이트 백엔드 크롤러 개발 <ArrowRightShort/> 종료<br/>
              <WrenchAdjustableCircleFill/> (개인) ICE 무료 포렌식 웹 애플리케이션 개발 <ArrowRightShort/> 진행중<br/>
              <WrenchAdjustableCircleFill/> (기업) LG 화학 PlantAI Backend 개발 / ETL 데이터 엔지니어링 진행중
            </p>
            <hr/>
              <Award/> 정보처리산업기사<br/>
              <Award/> 정보처리기능사<br/>
              <Award/> 네트워크관리사2급<br/>
              <Award/> 리눅스마스터2급<br/>

            <p>

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
            <Alert.Heading><Server/> ICE BackEnd(Stopped!)</Alert.Heading>
            <p>
              REST API SERVER<br/>
              언어 : Python<br/>
              프레임워크 : Fastapi, Pillow, Gunicorn, Uvicorn<br/>
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
                웹 포렌식 툴 추가 예정 With wasm compiled C++
            </p>
          </Alert>
        </Col>
        <Col md={12}>
          <Alert variant="info">
            <Alert.Heading><Stars/> 업데이트 내역</Alert.Heading>
            <p>
              <CalendarCheckFill/> 22.06.23 : 사이트 첫 배포<br/>
              <CalendarCheckFill/> 22.07.07 : EXIF 수정 기능 추가<br/>
              <CalendarCheckFill/> 22.08.01 : Backend Framework를 Flask에서 Fastapi로 변경<br/>
              <CalendarCheckFill/> 22.11.15 : Backend API 폐쇄, 단순화, 업그레이드 준비<br/>
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}
  
export default More;