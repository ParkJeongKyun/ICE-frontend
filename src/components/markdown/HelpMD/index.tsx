import ICEMarkDown from '..';

const txt = `
# 설명
- 브라우저 위에서 동작하는 서버리스 정적 웹 애플리케이션 입니다. ❄️    
- 사이트에서 파일을 열어도 서버에 저장 되거나 업로드 되지 않습니다.
- 수집 및 처리되는 개인정보는 없습니다.
- 용량이 너무 큰 파일은 읽기가 오래 걸릴 수 있습니다.

# [사용법](/markdown/howToUse)
위 "사용법" 링크를 클릭해서 확인해 주세요.

# 사용화면
## [ PC 버전 사용 화면 ]
![PC 버전 샘플 이미지](/images/sample/sample3.png)    

## [ Mobile 버전 사용 화면 ]
![모바일 버전 샘플 이미지](/images/sample/mobile_sample1.png)   

# 사이트 문의
아래 이메일 주소를 통해서 문의 해주시면 감사하겠습니다.
  - dbzoseh84@gmail.com
`;

const howToUse_txt = `
# 1. 분석할 파일 열기
![파일열기](/images/sample/example1.png)
1. 사이트 상단에 있는 "Open" 버튼 또는 홈화면에서 "파일 열기" 버튼을 클릭합니다.
2. 분석할 파일을 선택하고 열어주세요.

# 2. 분석 결과 확인하기
파일을 열면 아래와 같이 분석된 결과가 표시 됩니다.
![결과확인](/images/sample/example2.png)
  1. Thumbnail
      - 이미지의 썸네일 입니다.
      - 이미지 파일인 경우만 표시 됩니다.
  2. File Info
      - 파일명, 마지막 수정 시간, 파일 크기와 같은 정보가 표시됩니다.
  3. Map
      - 이미지가 촬영된 위치를 카카오 맵을 통해 표시합니다.
      - 이미지 파일인 경우만 표시 됩니다.
      - 메타데이터에서 위치 정보가 없는 경우 표시되지 않습니다.
      - 위치 정보가 국내가 아닌 경우 표시되지 않습니다.
  4. Exif Data
      - 이미지 파일의 메타데이터 정보 입니다.
      - 이미지 파일인 경우만 표시 됩니다.
      - 이미지 파일에서 메타데이터가 없는 경우 표시되지 않습니다.
  5. Hex Viewer
      - 파일 Hex 뷰어 입니다.
  6. Search
      - 검색 기능입니다.


# 3. 파일 Hex 검색하기
![파일검색](/images/sample/example3.png)
  - Offset, Hex, ASCII 값으로 검색이 가능합니다.
  - 해당되는 검색 결과를 선택하여 보여줍니다.
  - 최대 1000개까지의 검색 결과가 표시 됩니다.
  - "X" 버튼 클릭시 검색이 초기화 됩니다.
  - "PREV", "NEXT" 버튼으로 이전/다음 검색 결과를 볼 수 있습니다.
`;

const HelpMD: React.FC = () => {
  return (
    <>
      <ICEMarkDown
        defaultText={txt}
        childTexts={{
          howToUse: howToUse_txt,
        }}
      />
    </>
  );
};

export default HelpMD;
