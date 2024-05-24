import ICEMarkDown from '..';

const txt = `

## 릴리즈 노트

\`\`\`bash
cd 1234
\`\`\`
`;

const AboutMD: React.FC = () => {
  return (
    <>
      <ICEMarkDown markdownText={txt} />
    </>
  );
};

export default AboutMD;
