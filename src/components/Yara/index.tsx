import { useCallback, useState } from 'react';
import Collapse from '@/components/common/Collapse';
import { HexViewerRef } from '../HexViewer';
import { RuleTextarea, StartBtn } from './index.styles';

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
  const [inputRule, setInputRule] = useState(SAMPLE_RULE);
  const [result, setResult] = useState<string[]>();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputRule(e.target.value);
    },
    []
  );

  const allocateMemory = (size: number) => {
    const ptr = window.Module._malloc(size);
    return ptr;
  };

  const freeMemory = (ptr: number) => {
    window.Module._free(ptr);
  };

  const scanWithYaraAsync = (
    dataPtr: number,
    dataLength: number,
    rule: string
  ) => {
    return new Promise<void>((resolve) => {
      const scanWithYara = window.Module.cwrap('scan_with_yara', 'number', [
        'number',
        'number',
        'string',
      ]);
      scanWithYara(dataPtr, dataLength, rule);
      resolve();
    });
  };

  const getMatchedRuleNamesAsync = (countPtr: number) => {
    return new Promise<number>((resolve) => {
      const getMatchedRuleNames = window.Module.cwrap(
        'get_matched_rule_names',
        'number',
        ['number']
      );
      const ruleNamesPtr = getMatchedRuleNames(countPtr);
      resolve(ruleNamesPtr);
    });
  };

  const testYara = useCallback(async () => {
    const binaryData = hexViewerRef.current?.getBuffer();
    if (binaryData && inputRule) {
      const dataPtr = allocateMemory(binaryData.length);
      window.Module.HEAPU8.set(binaryData, dataPtr);

      await scanWithYaraAsync(dataPtr, binaryData.length, inputRule);

      const countPtr = allocateMemory(4);
      const ruleNamesPtr = await getMatchedRuleNamesAsync(countPtr);
      const count = window.Module.getValue(countPtr, 'i32');
      const matchedRuleNames = [];
      for (let i = 0; i < count; i++) {
        const ruleNamePtr = window.Module.getValue(ruleNamesPtr + i * 4, 'i32');
        const ruleName = window.Module.UTF8ToString(ruleNamePtr);
        matchedRuleNames.push(ruleName as string);
      }

      freeMemory(dataPtr);
      freeMemory(countPtr);
      setResult(matchedRuleNames);
    }
  }, [hexViewerRef, inputRule]);

  return (
    <Collapse title="Yara" open>
      <RuleTextarea value={inputRule} onChange={handleInputChange} />
      <StartBtn onClick={testYara}>룰 체크 시작</StartBtn>
      {result?.map((item, index) => <p key={index}>{item}</p>)}
    </Collapse>
  );
};

export default Yara;
