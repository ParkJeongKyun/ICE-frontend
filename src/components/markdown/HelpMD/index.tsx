import ICEMarkDown from '..';

const txt = `
웹 브라우저 위에서 동작하는 서버 리스 정적 웹 애플리케이션입니다.    
파일을 열어도 서버에 저장되거나 업로드 되지 않습니다.     
사이트 접속 요청만 구글 애널리틱스에 의해 수집되고 있으며 수집 및 처리되는 개인정보는 없습니다.    
      
[ 아래는 실제 사용 사진 예제 ]
![Example Image](/images/sample/sample1.png)    
- 표시되는 파일정보
  - Hex View
    - 파일 Hex 값을 보여줍니다
  - Thumbnail
    - (이미지 파일만) 이미지 썸네일을 표시합니다.
  - File Info
    - 파일 이름, 최근 수정 시간, 크기를 표시합니다.
  - Map
    - (이미지 파일만) 이미지 메타데이터 내에 있는 위치 정보를 표시합니다.
    - 위치 정보가 대한민국 국내인 경우만 표시됩니다.
  - Exif Data
    - (이미지 파일만) 이미지 메타데이터 정보를 분석해서 표시합니다.
    - 이미지 내부에 EXIF 정보가 없는 경우 표시되지 않습니다.

## 이미지 EXIF 메타데이터 분석하기
  - Open 버튼 클릭 > 이미지 파일 선택
 
## 파일 HexViewer 사용하기
  - Open 버튼 클릭 > 파일 선택
`;

const HelpMD: React.FC = () => {
  return (
    <>
      <ICEMarkDown markdownText={txt} />
    </>
  );
};

export default HelpMD;
