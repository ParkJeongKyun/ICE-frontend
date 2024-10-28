self.importScripts('/js/ice_yara.js');

self.onmessage = async function (e) {
  const { binaryData, inputRule } = e.data;

  const allocateMemory = (size) => self.Module._malloc(size);
  const freeMemory = (ptr) => self.Module._free(ptr);

  const scanWithYara = self.Module.cwrap('scan_with_yara', 'number', [
    'number',
    'number',
    'string',
  ]);

  const getMatchedRuleNames = self.Module.cwrap(
    'get_matched_rule_names',
    'number',
    ['number']
  );

  if (binaryData && inputRule) {
    const dataPtr = allocateMemory(binaryData.length);
    self.Module.HEAPU8.set(binaryData, dataPtr);

    const scanResult = scanWithYara(dataPtr, binaryData.length, inputRule);

    if (scanResult === 0) {
      const countPtr = allocateMemory(4);
      const ruleNamesPtr = getMatchedRuleNames(countPtr);
      const count = self.Module.getValue(countPtr, 'i32');
      const matchedRuleNames = [];
      for (let i = 0; i < count; i++) {
        const ruleNamePtr = self.Module.getValue(ruleNamesPtr + i * 4, 'i32');
        const ruleName = self.Module.UTF8ToString(ruleNamePtr);
        matchedRuleNames.push(ruleName);
      }

      freeMemory(dataPtr);
      freeMemory(countPtr);
      freeMemory(ruleNamesPtr);

      self.postMessage({ status: 'success', matchedRuleNames });
    } else {
      let errorMessage;
      switch (scanResult) {
        case 1:
          errorMessage = 'Failed to initialize YARA.';
          break;
        case 2:
          errorMessage = 'Failed to create YARA compiler.';
          break;
        case 3:
          errorMessage = 'Failed to compile YARA rule.';
          break;
        case 4:
          errorMessage = 'Failed to get compiled YARA rules.';
          break;
        case 5:
          errorMessage = 'Failed to scan binary data with YARA rules.';
          break;
        default:
          errorMessage = 'Unknown error occurred.';
      }

      freeMemory(dataPtr);

      throw new Error(errorMessage);
    }
  }
};
