const Yara: React.FC = () => {
  const testYara = () => {
    // Get the scan_with_yara function
    const scanWithYara = window.Module.cwrap('scan_with_yara', 'number', [
      'number',
      'number',
      'string',
    ]);

    // Get the get_matched_rule_names function
    const getMatchedRuleNames = window.Module.cwrap(
      'get_matched_rule_names',
      'number',
      ['number']
    );

    // Example binary data and YARA rule
    const binaryData = new Uint8Array([
      0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65,
    ]);
    const ruleStr = 'rule testrule { strings: $a = "example" condition: $a }';

    // Allocate memory for the binary data
    const dataPtr = window.Module._malloc(binaryData.length);
    window.Module.HEAPU8.set(binaryData, dataPtr);

    // Call the scan_with_yara function
    const result = scanWithYara(dataPtr, binaryData.length, ruleStr);

    // Get the matched rule names
    const countPtr = window.Module._malloc(4); // Allocate memory for the count
    const ruleNamesPtr = getMatchedRuleNames(countPtr);
    const count = window.Module.getValue(countPtr, 'i32');

    const matchedRuleNames = [];
    for (let i = 0; i < count; i++) {
      const ruleNamePtr = window.Module.getValue(ruleNamesPtr + i * 4, 'i32');
      const ruleName = window.Module.UTF8ToString(ruleNamePtr);
      matchedRuleNames.push(ruleName);
    }

    // Free allocated memory
    window.Module._free(dataPtr);
    window.Module._free(countPtr);

    return matchedRuleNames;
  };
  return <></>;
};

export default Yara;
