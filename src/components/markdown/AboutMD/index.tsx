import ICEMarkDown from '..';

const txt = `

## 릴리즈 노트

### v2024.05.24-demo
  - 사이트 디자인 웹앱 형식으로 리뉴얼
  - HexViewer 추가
`;

const AboutMD: React.FC = () => {
  return (
    <>
      <ICEMarkDown markdownText={txt} />
    </>
  );
};

export default AboutMD;
