import { useCallback, useEffect, useState } from 'react';
import Collapse from '@/components/common/Collapse';
import { HexViewerRef } from '../HexViewer';
import { SearchDiv, RuleTextarea, RuleTag } from './index.styles';
import { useProcess } from '@/contexts/ProcessContext';
import Btn from '@/components/common/Btn';

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
  const { processInfo, setProcessInfo } = useProcess();
  const { isProcessing } = processInfo;
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
    const newWorker = new Worker(
      new URL('/js/yara_worker.js', import.meta.url)
    );
    newWorker.onmessage = (e) => {
      setResult(e.data as string[]);
      setProcessInfo({ isProcessing: false });
    };
    newWorker.onerror = (e) => {
      setResult([]);
      setProcessInfo({ isProcessing: false });
    };
    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
  }, [setProcessInfo]);

  const testYara = useCallback(() => {
    setProcessInfo({ isProcessing: true });
    if (worker) {
      worker.postMessage({
        binaryData: hexViewerRef.current?.getBuffer(),
        inputRule,
      });
    }
  }, [worker, hexViewerRef, inputRule, setProcessInfo]);

  return (
    <Collapse title="Yara" open>
      <SearchDiv>
        <RuleTextarea value={inputRule} onChange={handleInputChange} />
        <Btn
          text="Rule Detection"
          onClick={testYara}
          disabled={isProcessing}
          disabledTxt="분석이 종료되면 다시 시도해주세요"
        />
        Detection Rules :
        {result.length > 0 ? (
          <>
            {result.map((item, index) => (
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
