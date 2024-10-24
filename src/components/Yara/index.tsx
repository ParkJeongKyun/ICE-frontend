import { useCallback, useEffect, useState } from 'react';
import Collapse from '@/components/common/Collapse';
import { HexViewerRef } from '../HexViewer';
import { SearchDiv, RuleTextarea, StartBtn, RuleTag } from './index.styles';

interface Props {
  hexViewerRef: React.RefObject<HexViewerRef>;
}

const SAMPLE_RULE = `
rule sample_rule {
  strings: $a = "sample"
  condition: $a 
}
`;

const Yara: React.FC<Props> = ({ hexViewerRef }) => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [inputRule, setInputRule] = useState(SAMPLE_RULE);
  const [result, setResult] = useState<string[]>([]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputRule(e.target.value);
    },
    []
  );

  useEffect(() => {
    const newWorker = new Worker(new URL('/js/yara_worker.js', import.meta.url));
    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
  }, []);

  const testYara = () => {
    if (worker) {
      const binaryData = hexViewerRef.current?.getBuffer();
      worker.postMessage({ binaryData, inputRule });
      worker.onmessage = (e) => {
        setResult(e.data as string[])
      };
    }
  };

  return (
    <Collapse title="Yara" open>
      <SearchDiv>
        <RuleTextarea value={inputRule} onChange={handleInputChange} />
        <StartBtn onClick={testYara}>Rule Detection</StartBtn>
        Detection Rules :
        {result.length > 0 ? (
          <>
            {result?.map((item, index) => (
              <RuleTag key={index}>{item}</RuleTag>
            ))}
          </>
        ) : (
          <> - </>
        )}
      </SearchDiv>
    </Collapse>
  );
};

export default Yara;
