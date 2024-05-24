import ICEMarkDown from '..';

const txt = `
## 개발자 
박정균 (Park Jeong-Kyun)
  - 2001. 02. 23
  - 한국(ROK, Republic of Korea), 서울(Seoul)
  - dbzoseh84@gmail.com
  - 디지털 포렌식, 보안, 웹

## 릴리즈 노트

### v2024.05.24-demo
  - 사이트 디자인 웹앱 형식으로 리뉴얼
  - HexViewer 추가

## 업데이트 예정
  - 디자인 개편
  - HexViewer UI 수정
  - HexViewer 검색 기능 추가
  - 저장 기능 추가
  - 터미널 기능 추가
  - 개발자 정보 페이지 추가
`;

const AboutMD: React.FC = () => {
  return (
    <>
      <ICEMarkDown markdownText={txt} />
    </>
  );
};

export default AboutMD;
