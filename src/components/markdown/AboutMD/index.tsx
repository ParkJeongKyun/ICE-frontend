import ICEMarkDown from '..';

const txt = `
# v2024.05.07-demo
## 개발자 
박정균 (Park Jeong-Kyun)
  - 2001. 02. 23
  - 한국(ROK, Republic of Korea), 서울(Seoul)
  - dbzoseh84@gmail.com
  - 디지털 포렌식, 보안, 웹

## [릴리즈 노트](/markdown/relase)

## 기술 스택
  - Typescript
  - Javascript
  - Go
  - React
  - WASM

## 소스 코드
  - [Github](https://github.com/ParkJeongKyun/ICE-frontend)

## 도움받은 레파지토리

## [업데이트 예정](/markdown/update)
`;

const relase_txt = `
## 릴리즈 노트

### v2024.05.07-demo
  - 레아아웃 조절 기능 추가
  - 마크다운 뷰어 기능 수정

### v2024.05.24-demo
  - 사이트 디자인 웹앱 형식으로 리뉴얼
  - HexViewer 기능 추가

### v2023.07.10
  - 구글 애널리틱스 추가
  - 사이트 디자인 변경
  - 웹어셈블리 파일을 C++에서 Go로 언어 변경
  - EXIF 수정 기능 제거

### v2023.02.27
  - Typescript 적용
  - 프론트엔드 리소스 업그레이드

### v2023.01.30
  - 사이트 디자인 변경

### v2022.12.24
  - Backend API를 웹어셈블리(C++를 컴파일한) 파일로 대체
  - 서버리스 웹 앱 형식으로 변경

### v2022.11.15
  - Backend API(Python, Nginx, GCP) 폐쇄

### v2022.08.01
  - Backend API를 Flask에서 Fastapi로 변경

### v2022.07.07
  - EXIF 수정 기능 추가
  - 카카오 맵 기능 추가

### v2022.06.23
  - ice-forensic.com 사이트 첫 배포
`;

const update_txt = `
## 업데이트 예정
  - 디자인 개편
  - HexViewer UI 수정
  - HexViewer 검색 기능 추가
  - 저장 기능 추가
  - 터미널 기능 추가
  - 개발자 정보 페이지 추가
  - 다국어 변역 기능 추가
  - 모바일 디자인 추가
`;

const AboutMD: React.FC = () => {
  return (
    <>
      <ICEMarkDown
        defaultText={txt}
        childTexts={{
          relase: relase_txt,
          update: update_txt,
        }}
      />
    </>
  );
};

export default AboutMD;
