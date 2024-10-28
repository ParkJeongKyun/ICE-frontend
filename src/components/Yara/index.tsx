import { useCallback, useEffect, useMemo, useState } from 'react';
import Collapse from '@/components/common/Collapse';
import { SearchDiv, RuleTextarea, RuleTag } from './index.styles';
import { useProcess } from '@/contexts/ProcessContext';
import Btn from '@/components/common/Btn';
import { useTabData } from '@/contexts/TabDataContext';

const SAMPLE_RULE = `
rule sample_rule {
  strings: $a = "sample"
  condition: $a 
}
`;

const Yara: React.FC = () => {
  const { activeData } = useTabData();
  const { processInfo, setProcessInfo, isProcessing, isFailure, isSuccess } =
    useProcess();
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
      new URL('/worker/yara_worker.js', import.meta.url)
    );
    newWorker.onmessage = (e) => {
      const { status, matchedRuleNames } = e.data;
      if (status === 'success') {
        setResult(matchedRuleNames);
      }
      setProcessInfo({ status: 'success', message: '' });
    };
    newWorker.onerror = (e) => {
      setResult([]);
      setProcessInfo({ status: 'failure', message: e.message });
    };
    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
  }, [setProcessInfo]);

  const testYara = useCallback(() => {
    setProcessInfo({ status: 'processing' });
    if (worker) {
      worker.postMessage({
        binaryData: activeData.buffer,
        inputRule,
      });
    }
  }, [worker, activeData, inputRule, setProcessInfo]);

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
        {isFailure && <div style={{ color: 'red' }}>{processInfo.message}</div>}
      </SearchDiv>
    </Collapse>
  );
};

export default Yara;
