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
  const { result, processInfo, isProcessing, isFailure, testYara } =
    useProcess();

  const [inputRule, setInputRule] = useState(SAMPLE_RULE);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputRule(e.target.value);
    },
    []
  );

  const onClickBtn = useCallback(() => {
    testYara(inputRule, activeData.buffer);
  }, [inputRule, activeData.buffer, testYara]);

  return (
    <Collapse title="Yara" open>
      <SearchDiv>
        <RuleTextarea value={inputRule} onChange={handleInputChange} />
        <Btn
          text="Rule Detection"
          onClick={onClickBtn}
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
