import ICEMarkDown from '..';

const txt = `
# 현재 버전 : ${import.meta.env.VITE_APP_VERSION}

안녕하세요!     
사이트 개발자 균입니다.

방문해주셔서 감사합니다.       

누구나 설치 없이 사용할 수 있으며,  
개인 정보나 파일이 서버에 업로드되지 않는  
**정적 포렌식 웹 앱**입니다.

제가 만든 사이트가 누군가에게 도움이 되었으면 좋겠네요. 

항상 건강하세요!

## [개발자](/About)
박정균 (Park Jeong-Kyun)
  - 2001. 02. 23
  - 한국(ROK, Republic of Korea), 서울(Seoul), 대구(Deagu)
  - dbzoseh84@gmail.com
  - 디지털 포렌식, 보안, 웹
  - 개발자에 대한 자세한 정보는 위 "개발자" 링크를 클릭해서 확인해 주세요.

## [릴리즈 노트](/markdown/relase)
릴리즈 노트를 확인하시려면    
위 "릴리즈 노트" 링크를 클릭해서 확인해 주세요.

## 기술 스택
  - Typescript
  - Javascript
  - Go
  - React
  - WebAssembly

## [업데이트 예정](/markdown/update)
앞으로 업데이트 할 내용이 궁금하시다면        
위 "업데이트 예정" 링크를 클릭해서 확인해 주세요.

## 소스 코드
  - [Github](https://github.com/ParkJeongKyun/ICE-frontend)

## 도움받은 사이트
사이트 개발에 도움을 준 사이트 및 라이브러리 입니다.     
감사합니다. 🙇‍♂️
  - [SVG REPO - 무료 아이콘](https://www.svgrepo.com/)
  - [Pixabay - 무료 사진](https://pixabay.com/)
  - [Framer Motion - 인터렉티브 웹 라이브러리](https://www.framer.com/motion/)
  - [Go Exif - GoLang Exif 분석 라이브러리](https://pkg.go.dev/github.com/dsoprea/go-exi)
  - [Yara - 악성코드 탐지 도구](https://github.com/VirusTotal/yara)
`;

const relase_txt = `
## 릴리즈 노트

### v2025.06.22-demo
  - 가상화라이브러리를 캔버스로 변경
  - 헥스뷰어 랜더링 속도 개선 최적화
  - 모바일 레이아웃 개선

### v2025.06.15-demo
  - 헥스 뷰어 선택 버그 수정
  - 웸 어셈블리 최적화
  - 1GB 이상의 파일을 불러올 경우 1GB까지만 읽도록 수정
  - 복사 기능 추가
  - 텍스트 인코딩 변경 기능 추가

### v2024.06.19-demo
  - 가상화 리스트 라이브러리 변경

### v2024.06.14-demo
  - 모바일 UI 추가 적용
  - 스크롤바 디자인 수정
  - 리스트 가상화 라이브러리 변경 및 최적화

### v2024.06.05-demo
  - Home 화면 추가
  - 마크다운 내용 수정

### v2024.06.02-demo
  - 헥스 뷰어 검색 타입 추가
    - 아스키 및 헥스 값 타입 추가
  - 헥스 뷰어 선택된 셀 정보 좌측 하단에 표시하는 기능 추가
  - About 페이지 추가

### v2024.05.29-demo
  - 헥스 뷰어 디자인 수정
  - 헥스 뷰어 오프셋 검색 기능
  - 헥스 뷰어 선택 기능 추가

### v2024.05.27-demo
  - 레아아웃 조절 기능 추가
  - 마크다운 뷰어 기능 수정

### v2024.05.24-demo
  - 사이트 디자인 웹앱 형식으로 리뉴얼
  - 헥스 뷰어 기능 추가

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
  - 터미널 기능 추가
  - 다국어 변역 기능 추가
  - 결과 저장 기능 추가
  - 헥스 뷰어 검색시 옵션 추가 및 알고리즘 최적화
  - 헥스 및 메타데이터 수정 기능 추가
  - Go 웹 어셈블리 개편, 최적화
  - 헥스뷰어 무한 스크롤 랜더링 속도 개편(자체 개발 필요)
  - 최적화
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
