import ICEMarkDown from '..';

const txt = `
# 소개
- 브라우저에서 동작하는 서버리스 정적 웹앱입니다. ❄️    
- 파일을 열어도 서버에 저장되거나 업로드되지 않습니다.
- 개인정보를 수집하거나 처리하지 않습니다.
- 대용량 파일은 로딩에 시간이 걸릴 수 있습니다.
- 꾸준히 업데이트 예정이니 많은 관심 부탁드립니다!

# [사용법](/markdown/howToUse)
상단의 "사용법" 링크를 클릭해 자세한 사용법을 확인하세요.

# 사용 예시 화면
## PC 버전
![PC 버전 샘플 이미지](/images/sample/sample3.png)

## 모바일 버전
![모바일 버전 샘플 이미지](/images/sample/mobile_sample1.png)

# 문의
문의 사항은 아래 이메일로 연락해 주세요.  
- dbzoseh84@gmail.com
`;

const howToUse_txt = `
# 1. 파일 열기
![파일열기](/images/sample/example1.png)
- 상단 "Open" 또는 홈의 "파일 열기" 버튼을 클릭하세요.
- 분석할 파일을 선택해 열어주세요.

# 2. 분석 결과 확인
![결과확인](/images/sample/example2.png)
- **Thumbnail**: 이미지 파일의 썸네일(이미지 파일만)
- **File Info**: 파일명, 수정 시간, 크기 등 정보
- **Map**: 촬영 위치를 지도에 표시(위치 정보가 있는 이미지 파일만)
- **Exif Data**: 이미지 메타데이터(이미지 파일만, 없으면 미표시)
- **Hex Viewer**: 파일 Hex 뷰어
- **Search**: Hex/ASCII/Offset 검색 기능

# 3. 검색
![파일검색](/images/sample/example3.png)
- Offset, Hex, ASCII 값으로 검색 가능
- 최대 1000개의 결과 표시
- "X"로 검색 초기화, "PREV"/"NEXT"로 결과 이동
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
