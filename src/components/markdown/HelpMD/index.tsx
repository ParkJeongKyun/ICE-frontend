import ICEMarkDown from '..';

const txt = `

## 이미지 EXIF 메타데이터 분석
  - Open 버튼 클릭 > 이미지 파일 선택
  - EXIF 정보가 없는 경우 표시되지 않음


## 파일 HexViewer
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
