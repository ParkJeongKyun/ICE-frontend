import { CDBBtn } from "cdbreact"
import { ShowInfo, ShowInfoLink } from "components/More/more"

// Icon
import { Github, Stars, PostcardFill, EmojiWink } from 'react-bootstrap-icons';

// Style
import "styles/more.css";

// 더보기 페이지
function More() {
  return (
    <div className="profile d-flex w-100">
      <div style={{flex:"1 1 auto", display:"flex", flexFlow:"column", height:"100%", overflowY:"hidden"}}>
          <div style={{height:"100%"}}>
              <div className="d-flex card-section">
                  <div className="cards-container2 w-100">

                  <div className="card-bg w-100 border shadow d-flex flex-column" style={{gridRow:"span 2"}}>
                      <img
                        alt="cardImg"
                        className="img-fluid"
                        style={{objectFit:"cover", maxHeight:"150px"}}
                        src='frozen.jpg'
                      />
                      <img alt="cardImg" className="mx-auto border rounded-circle" style={{marginTop:"-5rem"}} width="130px" height="130px" src="kyun.jpg" />
                      <div className="p-3 d-flex flex-column align-items-center mb-4 text-center">
                        <h4 style={{fontWeight:"600"}}>박정균(JeongKyun, Park)</h4>
                        <p>개발자, 디지털 포렌식 전문가 <img  alt="pol" width="17px" height="13px" style={{filter:"invert(100%)"}} src="pol.png"/><br/>(2001. 02. 23)</p>
                        <p>
                            제가 만든게 누군가에게 의미 있기를 바라며<br/>
                            세상 모든 분들께 감사합니다 <EmojiWink/>
                        </p>
                        <p>
                          <Stars/> 피드백/문의 : dbzoseh84@gmail.com <Stars/>
                        </p>
                        <p className="text-muted">서울 거주, 대구 출생</p>
                        <div className="d-flex justify-content-center flex-wrap">
                            <a target="_blank" rel="noopener noreferrer" href="https://blog.naver.com/dbzoseh84">
                            <CDBBtn className="mr-2" size="small" color="dark"><PostcardFill/> Blog</CDBBtn>
                            </a>
                        </div>
                      </div>
                    </div>

                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">학력/군경력</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>

                            <ShowInfo main_text="협성고등학교" sub_text="2017. 02 ~ 2020. 01. 07" side_text="졸업"/>
                            <ShowInfo main_text={<>영진직업전문학교<br/> 정보네트워크 시스템관리자 양성 과정</>} sub_text="2019. 03. 05 ~ 2019. 12. 30" side_text="위탁 학생 졸업"/>
                            <ShowInfo main_text="해군 3함대사령부" sub_text="2020. 11. 23 ~ 2022. 07. 22" side_text="병장 만기 전역"/>
                        </div>
                    </div>

                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">업무경력</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>
                            <ShowInfo main_text="해군 3함대사령부 사이버방호과" sub_text="2021. 01. 25 ~ 2022. 07. 22" side_text="CERT/사이버보안관제"/>
                            <ShowInfo main_text="NuriggumSoft(주) 지능개발팀" sub_text="2022. 07. 25 ~ 현재 재직중" side_text="SI 개발자/ETL 엔지니어링"/>
                        </div>
                    </div>

                    
                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">기업 프로젝트 경력</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>
                            <ShowInfo main_text="LG 화학 PlantAI Backend 개발" sub_text="2022. 07. 25 ~ 2023. 12. 30" side_text="종료"/>
                            <ShowInfo main_text="차세대 지방재정 시스템 AI 재정 분석 환경 개발" sub_text="2023. 01. 03 ~ " side_text="진행중"/>
                        </div>
                    </div>

                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">개인 프로젝트 경력</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>

                            <ShowInfo main_text="네이버 뉴스 크롤링 분석기 웹 애플리케이션 개발" sub_text="~ 2019. 12" side_text="종료"/>
                            <ShowInfo main_text="코로나나우 Backend 서버/크롤러 개발" sub_text="~ 2020. 03" side_text="종료"/>
                            <ShowInfo main_text="ICE 이미지 포렌식 웹 애플리케이션 개발" sub_text="2022. 06. 23 ~" side_text="진행중"/>
                        </div>
                    </div>


                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">자격증</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>

                            <ShowInfo main_text="디지털포렌식 전문가 2급" sub_text="2022. 12. 23" side_text="(사)한국포렌식학회"/>
                            <ShowInfo main_text="정보처리산업기사" sub_text="2022. 08. 10" side_text="한국산업인력공단"/>
                            <ShowInfo main_text="리눅스마스터2급" sub_text="2018. 12. 21" side_text="정보통신기술자격검정"/>
                            <ShowInfo main_text="네트워크관리사2급" sub_text="2018. 09. 11" side_text="한국정보통신자격협회"/>
                            <ShowInfo main_text="정보처리기능사" sub_text="2018. 09. 06" side_text="한국산업인력공단"/>
                        </div>
                    </div>


                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">업데이트 내역</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>

                            <ShowInfo main_text="ice-forensic.com 사이트 첫 배포" sub_text="2022. 06. 23" side_text=""/>
                            <ShowInfo main_text="EXIF 수정 기능 추가" sub_text="2022.07.07" side_text=""/>
                            <ShowInfo main_text="Backend API를 Flask에서 Fastapi로 변경" sub_text="2022. 08. 01" side_text=""/>
                            <ShowInfo main_text="Backend API(Python, Nginx, GCP) 폐쇄" sub_text="2022. 11. 15" side_text=""/>
                            <ShowInfo main_text="Backend API를 웹어셈블리(C++를 컴파일한) 파일로 대체" sub_text="2022. 12. 24" side_text=""/>
                            <ShowInfo main_text="디자인 화면 업그레이드" sub_text="2023. 01. 30" side_text=""/>
                            <ShowInfo main_text="Typescript 적용 및 프론트엔드 리소스 변경" sub_text="2023. 02. 27" side_text=""/>
                            <ShowInfo main_text="EXIF 분석 세부정보 및 EXIF 설명 페이지 추가 예정" sub_text="2023." side_text=""/>
                        </div>
                    </div>

                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">ICE</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>

                            <ShowInfo main_text="사용언어" sub_text="Javascript, HTML, CSS, C++(WASM), Python(전 백엔드에서 사용)" side_text=""/>
                            <ShowInfo main_text="대표 아키텍처" sub_text="React, Bootstrap, KakaoMap, Emscripten, Netlify" side_text=""/>
                            <ShowInfoLink main_text={<><Github/> 소스코드</>} sub_text="Github 레파지토리" link="https://github.com/ParkJeongKyun/ICE-frontend"/>
                        </div>
                    </div>

                    <div className="w-100 border d-flex flex-column shadow">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="m-0 h5 font-weight-bold text-dark">참고 소스 출처</h4>
                                <div className="py-1 px-2 bg-grey rounded-circle"></div>
                            </div>

                            <ShowInfoLink main_text="ReactJS" sub_text="리액트 공식 문서" link="https://ko.reactjs.org"/>
                            <ShowInfoLink main_text="Bootstrap" sub_text="부트스트랩 공식 문서" link="https://getbootstrap.kr"/>
                            <ShowInfoLink main_text="KaKaoMap API" sub_text="카카오맵API 공식 문서" link="https://apis.map.kakao.com"/>
                            <ShowInfoLink main_text="React-dropzone" sub_text="이미지 드롭존" link="https://react-dropzone.js.org"/>
                            <ShowInfoLink main_text="CDB React" sub_text="CDB 리액트" link=" https://www.npmjs.com/package/cdbreact"/>
                            <ShowInfoLink main_text="React-terminal-ui" sub_text="리액트 터미널 UI" link="https://www.npmjs.com/package/react-terminal-ui"/>
                            <ShowInfoLink main_text="Three.js" sub_text="Three.js 공식 문서" link="https://www.npmjs.com/package/@react-three/drei"/>
                            <ShowInfoLink main_text="CDBReact-admin-template" sub_text="대쉬보드 디자인/템플릿 참고" link="https://github.com/Devwares-Team/cdbreact-admin-template"/>
                            <ShowInfoLink main_text="Emscripten" sub_text="C++를 웹어셈블리 파일로 컴파일" link="https://emscripten.org"/>
                            <ShowInfoLink main_text="Easyexif" sub_text="Exif 분석 C++ 모듈 참고 소스" link="https://github.com/mayanklahiri/easyexif"/>
                            <ShowInfoLink main_text="Three.js codesandbox" sub_text="노트북 모델 및 Three.js 참고 소스" link="https://codesandbox.io/s/9keg6"/>
                        </div>
                    </div>

                  </div>
              </div>
              <footer className="d-flex mx-auto py-4">
                <small className="mx-auto my-1 text-center">&copy; Jeongkyun-Park. All rights reserved. dbzoseh84@gmail.com</small>
              </footer>
          </div>
      </div>
    </div>
  );
}

export default More;